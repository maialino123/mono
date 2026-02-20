import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const SCRIPTS_DIR = resolve(import.meta.dir);

const COMMANDS: Record<string, { script: string; args?: string[]; desc: string }> = {
  init: { script: "init.ts", desc: "Initialize cyberk-flow in project" },
  changes: { script: "list.ts", args: ["changes"], desc: "List changes with task progress" },
  specs: { script: "list.ts", args: ["specs"], desc: "List specs with requirement count" },
  new: { script: "new-change.ts", desc: "Create new change (kebab-case)" },
  validate: { script: "validate-change.ts", desc: "Validate delta specs" },
  apply: { script: "apply-deltas.ts", desc: "Apply delta specs to main specs" },
  archive: { script: "archive-change.ts", desc: "Move change to archive/" },
  release: { script: "release.ts", desc: "Create a release (bump version + changelog)" },
  migrate: { script: "migrate.ts", desc: "Migrate openspec/ to cyberk-flow/" },
  "migrate-archive": { script: "migrate-archive.ts", desc: "Rename old archive dirs to yyMMdd-HHmm format" },
  update: { script: "update.ts", desc: "Update skills from cyberk-dev/cyberk-skills" },
  index: { script: "index-memory.ts", desc: "Index project files for memory search" },
  search: { script: "search-memory.ts", desc: "Search indexed memory store" },
};

const HELP_FLAGS = new Set(["help", "-h", "--help"]);

function printUsage(exitCode = 0): never {
  console.log("Usage: bun run cf <command> [args]\n");
  console.log("Commands:");
  for (const [name, { desc }] of Object.entries(COMMANDS)) {
    console.log(`  ${name.padEnd(12)} ${desc}`);
  }
  process.exit(exitCode);
}

if (import.meta.main) {
  const [command, ...args] = process.argv.slice(2);

  if (!command || HELP_FLAGS.has(command)) {
    printUsage(0);
  }
  if (!COMMANDS[command]) {
    console.error(`Unknown command: ${command}\n`);
    printUsage(1);
  }

  const { script, args: prefixArgs } = COMMANDS[command];
  const scriptArgs = [...(prefixArgs ?? []), ...args];

  const result = spawnSync("bun", ["run", resolve(SCRIPTS_DIR, script), ...scriptArgs], {
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error);
  }
  process.exit(result.status ?? 1);
}
