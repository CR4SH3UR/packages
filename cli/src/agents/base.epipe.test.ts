import assert from "node:assert/strict";
import { test } from "node:test";
import { ACP } from "./base";
import { AgentUnavailableError } from "./errors";

test("writing to a dead agent stdin becomes AgentUnavailableError, not uncaught EPIPE", async () => {
	const spawned = ACP.spawnAgentProcess({
		name: "epipe-test",
		command: process.execPath,
		args: ["-e", "process.exit(0)"],
	});

	await new Promise<void>((resolve) => {
		if (spawned.process.exitCode !== null) {
			resolve();
			return;
		}
		spawned.process.once("exit", () => resolve());
	});

	const writer = spawned.stream.writable.getWriter();
	await assert.rejects(
		() =>
			writer.write({
				jsonrpc: "2.0",
				method: "session/prompt",
				id: 1,
				params: {},
			}),
		(err: unknown) => {
			assert.ok(
				err instanceof AgentUnavailableError,
				`expected AgentUnavailableError, got ${String(err)}`,
			);
			assert.match(err.message, /write EPIPE/);
			return true;
		},
	);
});

test("stdin EPIPE after the child closes the pipe is not uncaught", async () => {
	const spawned = ACP.spawnAgentProcess({
		name: "epipe-close-test",
		command: process.execPath,
		args: ["-e", "process.stdin.resume(); process.stdin.destroy()"],
	});

	await Promise.race([
		new Promise<void>((resolve) => {
			spawned.process.stdin.once("error", () => resolve());
			spawned.process.once("exit", () => resolve());
		}),
		new Promise<void>((resolve) => setTimeout(resolve, 250)),
	]);

	const writer = spawned.stream.writable.getWriter();
	await assert.rejects(
		() =>
			writer.write({
				jsonrpc: "2.0",
				method: "initialize",
				id: 2,
				params: {},
			}),
		AgentUnavailableError,
	);

	spawned.process.kill();
});
