import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { init } from "./init.ts";

const CYBERK_FLOW_DIR = "cyberk-flow";
const OPENSPEC_SKILL_DIRS = [join(".agents", "skills", "openspec")];

interface MigrateCounts {
  specs: number;
  changes: number;
  archived: number;
  workflows: number;
  skipped: number;
}

function copyDirRecursive(
  src: string,
  dest: string,
  counts: MigrateCounts,
  countKey: "specs" | "changes" | "archived",
): void {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath, counts, countKey);
    } else {
      if (existsSync(destPath)) {
        counts.skipped++;
        console.log(`  ⚠ Skipped existing: ${destPath}`);
      } else {
        mkdirSync(dirname(destPath), { recursive: true });
        cpSync(srcPath, destPath);
        counts[countKey]++;
        console.log(`  📄 Copied ${destPath}`);
      }
    }
  }
}

function injectWorkflows(counts: MigrateCounts): void {
  const changesDir = join(CYBERK_FLOW_DIR, "changes");
  const templatePath = join(CYBERK_FLOW_DIR, "templates", "workflow.md");
  if (!existsSync(changesDir) || !existsSync(templatePath)) return;

  const template = readFileSync(templatePath, "utf-8");

  for (const entry of readdirSync(changesDir)) {
    if (entry === "archive") continue;
    const changeDir = join(changesDir, entry);
    if (!statSync(changeDir).isDirectory()) continue;

    const workflowPath = join(changeDir, "workflow.md");
    if (existsSync(workflowPath)) continue;

    // Copy template and mark all Plan steps as done
    const lines = template.split("\n");
    let inPlan = false;
    const patched = lines.map((line) => {
      if (line.startsWith("## Plan")) {
        inPlan = true;
        return line;
      }
      if (line.startsWith("## ") && inPlan) {
        inPlan = false;
      }
      if (inPlan) {
        return line.replace("- [ ]", "- [x]");
      }
      return line;
    });

    writeFileSync(workflowPath, patched.join("\n"), "utf-8");
    counts.workflows++;
    console.log(`  📝 Injected workflow.md → ${workflowPath}`);
  }
}

function removeOpenspecSkill(): void {
  for (const dir of OPENSPEC_SKILL_DIRS) {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
      console.log(`  🗑  Removed old openspec skill: ${dir}/`);
    }
  }
}

interface MigrateOptions {
  skipInit?: boolean;
}

async function migrate(source = "openspec", options: MigrateOptions = {}): Promise<void> {
  const srcPath = resolve(source);

  if (!existsSync(srcPath)) {
    throw new Error(`Source directory '${source}' does not exist.`);
  }

  if (!existsSync(CYBERK_FLOW_DIR) && !options.skipInit) {
    console.log("cyberk-flow/ not found, initializing first...\n");
    await init(true, { autoMigrate: false });
    console.log("");
  }

  console.log(`Migrating ${source}/ → ${CYBERK_FLOW_DIR}/...\n`);

  // Ensure cyberk-flow directories exist even with skipInit
  mkdirSync(join(CYBERK_FLOW_DIR, "specs"), { recursive: true });
  mkdirSync(join(CYBERK_FLOW_DIR, "changes", "archive"), { recursive: true });
  mkdirSync(join(CYBERK_FLOW_DIR, "templates"), { recursive: true });

  const counts: MigrateCounts = { specs: 0, changes: 0, archived: 0, workflows: 0, skipped: 0 };

  // Copy specs/
  const specsDir = join(srcPath, "specs");
  if (existsSync(specsDir)) {
    console.log("📁 Copying specs/...");
    copyDirRecursive(specsDir, join(CYBERK_FLOW_DIR, "specs"), counts, "specs");
  }

  // Copy changes/
  const changesDir = join(srcPath, "changes");
  if (existsSync(changesDir)) {
    console.log("📁 Copying changes/...");
    for (const entry of readdirSync(changesDir)) {
      const srcEntry = join(changesDir, entry);
      const destEntry = join(CYBERK_FLOW_DIR, "changes", entry);
      if (!statSync(srcEntry).isDirectory()) {
        if (!existsSync(destEntry)) {
          mkdirSync(dirname(destEntry), { recursive: true });
          cpSync(srcEntry, destEntry);
          counts.changes++;
          console.log(`  📄 Copied ${destEntry}`);
        } else {
          counts.skipped++;
          console.log(`  ⚠ Skipped existing: ${destEntry}`);
        }
        continue;
      }
      if (entry === "archive") {
        copyDirRecursive(srcEntry, destEntry, counts, "archived");
      } else {
        copyDirRecursive(srcEntry, destEntry, counts, "changes");
      }
    }
  }

  // Copy project.md (always overwrite — user's project context takes priority over template default)
  const projectMdSrc = join(srcPath, "project.md");
  const projectMdDest = join(CYBERK_FLOW_DIR, "project.md");
  if (existsSync(projectMdSrc)) {
    cpSync(projectMdSrc, projectMdDest);
    console.log(`  📄 Copied ${projectMdDest}`);
  }

  // Ensure templates are present
  if (!options.skipInit) {
    console.log("\n🔄 Ensuring templates are present...");
    await init(true, { autoMigrate: false });
  }

  // Inject workflow.md into active changes
  console.log("\n📝 Injecting workflow.md into active changes...");
  injectWorkflows(counts);

  // Delete source (only auto-delete canonical openspec path when no files were skipped)
  const canonicalOpenspec = resolve("openspec");
  if (srcPath === canonicalOpenspec && counts.skipped === 0) {
    console.log(`\n🗑  Removing ${source}/...`);
    rmSync(srcPath, { recursive: true, force: true });
  } else if (counts.skipped > 0) {
    console.log(`\n⚠  ${counts.skipped} file(s) were skipped due to conflicts — keeping ${source}/ for manual review.`);
    console.log(`   Remove manually after resolving: rm -rf ${srcPath}`);
  } else {
    console.log("\n⚠  Source is not the canonical openspec/ — skipping auto-delete.");
    console.log(`   Remove manually if desired: rm -rf ${srcPath}`);
  }

  // Remove old openspec skill
  removeOpenspecSkill();

  // Summary
  console.log(`
✅ Migration complete!

Summary:
  📋 Specs copied:       ${counts.specs}
  📝 Changes copied:     ${counts.changes}
  📦 Archived copied:    ${counts.archived}
  🔄 Workflows injected: ${counts.workflows}
  ⚠ Files skipped:      ${counts.skipped}
`);
}

export { migrate };

if (import.meta.main) {
  const source = process.argv[2] || "openspec";
  try {
    await migrate(source);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
