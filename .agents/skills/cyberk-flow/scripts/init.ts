import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { findSkillTemplatesDir } from "./lib/find-templates.ts";

const CYBERK_FLOW_DIR = "cyberk-flow";
const OPENSPEC_DIR = "openspec";
const MARKER_FILE = join(CYBERK_FLOW_DIR, "project.md");
const ROOT_AGENTS_FILE = "AGENTS.md";

const DIRS = [join(CYBERK_FLOW_DIR, "changes", "archive"), join(CYBERK_FLOW_DIR, "specs")];

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

  // 3. Create root AGENTS.md from template if it doesn't exist
  if (skillTemplatesDir) {
    const agentsMdSrc = join(skillTemplatesDir, "ROOT_AGENTS.md");
    if (!existsSync(ROOT_AGENTS_FILE) && existsSync(agentsMdSrc)) {
      cpSync(agentsMdSrc, ROOT_AGENTS_FILE);
      console.log(`  📄 Created ${ROOT_AGENTS_FILE}`);
    } else {
      console.log(`  ✓  ${ROOT_AGENTS_FILE} (exists — agent will merge missing sections after init)`);
    }
  }

  // 4. Ensure @huggingface/transformers is installed (for semantic memory search)
  const pkgJsonPath = resolve("package.json");
  if (existsSync(pkgJsonPath)) {
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
    const devDeps = pkg.devDependencies ?? {};
    if (!devDeps["@huggingface/transformers"]) {
      console.log("\n  📦 Installing @huggingface/transformers (semantic memory search)...");
      pkg.devDependencies = { ...devDeps, "@huggingface/transformers": "latest" };
      writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n");
      execSync("bun install", { stdio: "inherit" });
      console.log("  ✓  @huggingface/transformers installed.");
    } else {
      console.log("\n  ✓  @huggingface/transformers (already installed)");
    }
  }

  // 5. Auto-migrate from openspec if detected
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
