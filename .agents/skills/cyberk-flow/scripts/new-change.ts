import { cpSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

const name = process.argv[2];
if (!name) {
  console.error("Usage: bun run new-change.ts <change-name>");
  process.exit(1);
}

if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error("Error: Change name must be kebab-case (e.g., add-auth, refactor-db)");
  process.exit(1);
}

const changeDir = join("cyberk-flow", "changes", name);
if (existsSync(changeDir)) {
  console.error(`Error: Change '${name}' already exists at ${changeDir}`);
  process.exit(1);
}

mkdirSync(join(changeDir, "specs"), { recursive: true });

const templatesDir = join("cyberk-flow", "templates");
if (!existsSync(templatesDir)) {
  console.error(`Error: Templates dir not found at ${templatesDir} (run from project root?)`);
  process.exit(1);
}

const REQUIRED_TEMPLATES = ["tasks.md", "workflow.md"];
const OPTIONAL_TEMPLATES = ["design.md", "discovery.md", "proposal.md"];
const available = new Set(readdirSync(templatesDir));
for (const file of REQUIRED_TEMPLATES) {
  if (!available.has(file)) {
    console.error(`Error: required template ${file} missing in ${templatesDir}`);
    process.exit(1);
  }
  cpSync(join(templatesDir, file), join(changeDir, file));
}
for (const file of OPTIONAL_TEMPLATES) {
  if (!available.has(file)) {
    console.warn(`Warning: optional template ${file} missing in ${templatesDir}`);
    continue;
  }
  cpSync(join(templatesDir, file), join(changeDir, file));
}

console.log(`Created change '${name}' at ${changeDir}/`);
