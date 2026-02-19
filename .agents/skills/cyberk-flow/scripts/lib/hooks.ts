import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const HOOKS_DIR = join("cyberk-flow", "hooks");

export type HookName =
  | "pre-new-change"
  | "post-new-change"
  | "pre-apply-deltas"
  | "post-apply-deltas"
  | "pre-archive-change"
  | "post-archive-change"
  | "pre-validate-change"
  | "post-validate-change";

/**
 * Run a hook script if it exists in `cyberk-flow/hooks/`.
 * Looks for `<hookName>.ts` first, then `<hookName>.sh`.
 * Passes extra args to the hook script.
 * Returns true if the command should proceed (hook succeeded, no hook found, or post-hook failed).
 * Returns false only if a pre-hook failed — caller should abort.
 */
export function runHook(hookName: HookName, args: string[] = []): boolean {
  const tsHook = join(HOOKS_DIR, `${hookName}.ts`);
  const shHook = join(HOOKS_DIR, `${hookName}.sh`);

  let cmd: string;
  let cmdArgs: string[];

  if (existsSync(tsHook)) {
    cmd = "bun";
    cmdArgs = ["run", tsHook, ...args];
  } else if (existsSync(shHook)) {
    cmd = "sh";
    cmdArgs = [shHook, ...args];
  } else {
    return true;
  }

  const isPreHook = hookName.startsWith("pre-");

  console.log(`🪝 Running hook: ${hookName}`);
  const result = spawnSync(cmd, cmdArgs, { stdio: "inherit" });

  const failed = result.error != null || result.status !== 0;

  if (failed) {
    const detail = result.error
      ? String(result.error)
      : result.signal
        ? `signal ${result.signal}`
        : `exit code ${result.status}`;

    if (isPreHook) {
      console.error(`Hook '${hookName}' failed (${detail})`);
      return false;
    }
    console.error(`Hook '${hookName}' failed (${detail}) (non-blocking)`);
  }

  return true;
}
