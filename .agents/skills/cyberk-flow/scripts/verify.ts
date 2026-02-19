import { spawnSync } from "node:child_process";
import { getVerifyCommands } from "./lib/parse-commands.ts";

function run(): void {
  const includeE2e = process.argv.includes("--e2e");

  let commands: { label: string; command: string }[];
  try {
    commands = getVerifyCommands({ includeE2e });
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }

  console.log("🔍 Verify commands (from cyberk-flow/project.md § Commands):\n");
  for (const { label, command } of commands) {
    console.log(`  ${label}: ${command}`);
  }
  console.log();

  let failed = false;
  for (const { label, command } of commands) {
    console.log(`▶ ${label}: ${command}`);
    const result = spawnSync(command, { stdio: "inherit", shell: true });

    if (result.error) {
      console.error(`  ✗ ${label} failed to start: ${result.error.message}`);
      failed = true;
      break;
    }
    if (result.status !== 0) {
      console.error(`  ✗ ${label} failed (exit ${result.status})`);
      failed = true;
      break;
    }
    console.log(`  ✓ ${label} passed\n`);
  }

  if (failed) {
    console.error("\n❌ Verification failed.");
    process.exit(1);
  }

  console.log("✅ All verify commands passed.");
}

if (import.meta.main) {
  run();
}
