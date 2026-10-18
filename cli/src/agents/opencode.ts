import { BUILTIN_AGENT_DESCRIPTORS } from "./agents";
import { ACP } from "./base";
import type { AcpTranscriptOptions } from "./events";
import {
	normalizeUserFileAttachmentReplayMessage,
	shouldSkipOpenCodeReadReplayContent,
} from "./replay-normalization";

/**
 * OpenCode ACP client.
 *
 * Session listing goes through ACP `session/list`. A previous revision also
 * spawned a second `opencode serve` via `@opencode-ai/sdk` to enrich that
 * list with project metadata. That extra process raced the ACP child's
 * private server and closed its stdin, so the next JSON-RPC write failed
 * with `write EPIPE`. OpenCode's ACP `session/list` now returns cwd, title,
 * timestamps, and paging, so the second server is no longer needed.
 */
export class OpenCode extends ACP {
	static create() {
		return new OpenCode();
	}

	constructor() {
		super(BUILTIN_AGENT_DESCRIPTORS.opencode);
	}

	protected override transcriptOptions(): AcpTranscriptOptions {
		return {
			shouldSkipUserReplayContent: shouldSkipOpenCodeReadReplayContent,
			normalizeUserReplayMessage: normalizeUserFileAttachmentReplayMessage,
		};
	}
}
