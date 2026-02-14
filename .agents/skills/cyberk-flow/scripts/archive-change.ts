import { existsSync, mkdirSync, renameSync } from "fs";
import { join } from "path";

const name = process.argv[2];
if (!name) {
  console.error("Usage: bun run archive-change.ts <change-name>");
  process.exit(1);
}

const changeDir = join("cyberk-flow", "changes", name);
if (!existsSync(changeDir)) {
  console.error(`Error: Change '${name}' not found at ${changeDir}`);
  process.exit(1);
}

const now = new Date();
const y = now.getUTCFullYear();
const mo = String(now.getUTCMonth() + 1).padStart(2, "0");
const d = String(now.getUTCDate()).padStart(2, "0");
const h = String(now.getUTCHours()).padStart(2, "0");
const mi = String(now.getUTCMinutes()).padStart(2, "0");
const archiveName = `${y}-${mo}-${d}-${h}${mi}-${name}`;
const archiveDir = join("cyberk-flow", "changes", "archive", archiveName);

if (existsSync(archiveDir)) {
  console.error(`Error: Archive '${archiveName}' already exists`);
  process.exit(1);
}

mkdirSync(join("cyberk-flow", "changes", "archive"), { recursive: true });
renameSync(changeDir, archiveDir);

console.log(`Archived '${name}' → archive/${archiveName}/`);
