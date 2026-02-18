import { existsSync, mkdirSync, cpSync } from "fs";
import { join, resolve } from "path";
import { findSkillTemplatesDir } from "./lib/find-templates.ts";

const CYBERK_FLOW_DIR = "cyberk-flow";
const OPENSPEC_DIR = "openspec";
const MARKER_FILE = join(CYBERK_FLOW_DIR, "project.md");

const DIRS = [
  join(CYBERK_FLOW_DIR, "changes", "archive"),
  join(CYBERK_FLOW_DIR, "specs"),
];

function isInitialized(): boolean {
  return existsSync(MARKER_FILE);
}

interface InitOptions {
  autoMigrate?: boolean;
}

async function init(force = false, options: InitOptions = {}): Promise<void> {
  const { autoMigrate = true } = options;

  if (isInitialized() && !force) {
    console.log("✓ cyberk-flow is already initialized.");
    console.log(`  Root: ${resolve(CYBERK_FLOW_DIR)}/`);
    console.log("  Use --force to re-initialize (won't overwrite existing files).");
    return;
  }

  console.log("Initializing cyberk-flow...\n");

  // 1. Create directory structure
  for (const dir of DIRS) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`  📁 Created ${dir}/`);
    } else {
      console.log(`  ✓  ${dir}/ (exists)`);
    }
  }

  // 2. Copy project.md from skill templates (the main marker)
  const skillTemplatesDir = findSkillTemplatesDir();
  if (skillTemplatesDir) {
    const projectMdSrc = join(skillTemplatesDir, "project.md");
    if (!existsSync(MARKER_FILE) && existsSync(projectMdSrc)) {
      cpSync(projectMdSrc, MARKER_FILE);
      console.log(`  📄 Created ${MARKER_FILE}`);
    }
  } else {
    console.warn("  ⚠  Could not find skill templates directory. Skipping project.md copy.");
  }

  // 3. Auto-migrate from openspec if detected
  if (autoMigrate && existsSync(OPENSPEC_DIR)) {
    console.log(`\n  🔄 Detected ${OPENSPEC_DIR}/, auto-migrating...`);
    const { migrate } = await import("./migrate.ts");
    await migrate(OPENSPEC_DIR, { skipInit: true });
  }

  console.log(`
✅ cyberk-flow initialized!

Directory structure:
  ${CYBERK_FLOW_DIR}/
  ├── changes/          # Active change proposals
  │   └── archive/      # Completed changes
  ├── specs/            # Consolidated specifications
  └── project.md        # Project context (fill this out!)

Next steps:
  1. Fill out ${MARKER_FILE} with your project details.
     (Ask your AI assistant: "introspect my project and fill cyberk-flow/project.md")
  2. Start a new change:
     bun run .agents/skills/cyberk-flow/scripts/new-change.ts <change-name>
`);
}

// --- Exports for use by SKILL.md auto-init ---
export { isInitialized, init };

// --- CLI entry ---
if (import.meta.main) {
  const force = process.argv.includes("--force");
  await init(force);
}
