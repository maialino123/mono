import { cpSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { findSkillTemplatesDir } from "./lib/find-templates.ts";

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

const templatesDir = findSkillTemplatesDir();
if (!templatesDir) {
  console.error("Error: Could not find skill templates directory");
  process.exit(1);
}

const REQUIRED_TEMPLATES = ["tasks.md", "workflow.md"];
for (const file of REQUIRED_TEMPLATES) {
  const src = join(templatesDir, file);
  if (!existsSync(src)) {
    console.error(`Error: required template ${file} missing in ${templatesDir}`);
    process.exit(1);
  }
  cpSync(src, join(changeDir, file));
}

console.log(`Created change '${name}' at ${changeDir}/`);
