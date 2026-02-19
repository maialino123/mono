import { spawnSync } from "node:child_process";

const REPO = "cyberk-dev/cyberk-skills";

export function update(): number {
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(npx, ["--yes", "skills", "add", REPO, "--skill", "cyberk-flow", "--agent", "amp"], {
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error);
    return 1;
  }

  return result.status ?? 1;
}

if (import.meta.main) {
  process.exit(update());
}
