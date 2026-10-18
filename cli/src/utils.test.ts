import assert from "node:assert/strict";
import { test } from "node:test";

import { isBrokenPipeError } from "./utils";

test("isBrokenPipeError recognizes write EPIPE and related stream codes", () => {
	assert.equal(isBrokenPipeError({ code: "EPIPE" }), true);
	assert.equal(isBrokenPipeError({ code: "ERR_STREAM_DESTROYED" }), true);
	assert.equal(isBrokenPipeError({ code: "ERR_STREAM_WRITE_AFTER_END" }), true);
	assert.equal(isBrokenPipeError({ code: "ECONNRESET" }), false);
	assert.equal(isBrokenPipeError(new Error("write EPIPE")), false);
	assert.equal(isBrokenPipeError("write EPIPE"), false);
	assert.equal(isBrokenPipeError(null), false);
});
