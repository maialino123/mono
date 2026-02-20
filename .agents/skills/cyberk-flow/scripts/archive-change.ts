import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runHook } from "./lib/hooks.ts";

export function formatArchiveName(date: Date, changeId: string): string {
  const y = String(date.getUTCFullYear()).slice(-2);
  const mo = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  return `${y}${mo}${d}-${h}${mi}-${changeId}`;
}

function extractArchiveSection(content: string): string | null {
  const normalized = content.replace(/\r\n?/g, "\n");
  const match = normalized.match(/^##\s+Archive\s*$/m);
  if (!match || match.index === undefined) return null;

  const startOfBody = normalized.indexOf("\n", match.index);
  if (startOfBody === -1) return null;

  const nextSection = normalized.indexOf("\n## ", startOfBody + 1);
  return nextSection === -1 ? normalized.slice(startOfBody) : normalized.slice(startOfBody, nextSection);
}

function validateArchiveSection(workflowPath: string): string[] {
  if (!existsSync(workflowPath)) {
    return ["workflow.md not found"];
  }
  const content = readFileSync(workflowPath, "utf-8");

  const section = extractArchiveSection(content);
  if (section === null) {
    return ["## Archive section not found in workflow.md"];
  }

  const unchecked: string[] = [];
  for (const line of section.split("\n")) {
    const match = line.match(/^\s*-\s*\[\s\]\s+(.+)$/);
    if (match) {
      const label = match[1].trim();
      if (/^Archive change:/i.test(label)) continue;
      unchecked.push(label);
    }
  }
  return unchecked;
}

function tickArchiveCheckbox(workflowPath: string) {
  if (!existsSync(workflowPath)) return;
  let content = readFileSync(workflowPath, "utf-8");

  const section = extractArchiveSection(content);
  if (!section) return;

  const re = /^(\s*-\s*\[)\s(\]\s+Archive change:.*)$/m;
  const sectionTicked = section.replace(re, "$1x$2");
  if (sectionTicked !== section) {
    content = content.replace(section, sectionTicked);
    writeFileSync(workflowPath, content, "utf-8");
  }
}

if (import.meta.main) {
  const name = process.argv[2];
  if (!name) {
    console.error("Usage: bun run cf archive <change-name>");
    process.exit(1);
  }

  const changeDir = join("cyberk-flow", "changes", name);
  if (!existsSync(changeDir)) {
    console.error(`Error: Change '${name}' not found at ${changeDir}`);
    process.exit(1);
  }

  const workflowPath = join(changeDir, "workflow.md");
  const unchecked = validateArchiveSection(workflowPath);
  if (unchecked.length > 0) {
    console.error("ERROR: Cannot archive — incomplete workflow steps in ## Archive:");
    for (const item of unchecked) {
      console.error(`  - [ ] ${item}`);
    }
    process.exit(1);
  }

  if (!runHook("pre-archive-change", [name])) process.exit(1);

  tickArchiveCheckbox(workflowPath);

  const now = new Date();
  const archiveName = formatArchiveName(now, name);
  const archiveDir = join("cyberk-flow", "changes", "archive", archiveName);

  if (existsSync(archiveDir)) {
    console.error(`Error: Archive '${archiveName}' already exists`);
    process.exit(1);
  }

  mkdirSync(join("cyberk-flow", "changes", "archive"), { recursive: true });
  renameSync(changeDir, archiveDir);

  console.log(`Archived '${name}' → archive/${archiveName}/`);

  runHook("post-archive-change", [name]);

  // Auto-index archive after archiving
  try {
    const { createMemoryStore } = await import("./lib/memory/index");
    const store = createMemoryStore(process.cwd());
    try {
      const summary = await store.index();
      console.log(
        `Memory re-indexed: ${summary.added} new, ${summary.updated} updated, ${summary.removed} removed, ${summary.unchanged} unchanged`,
      );
    } finally {
      store.close();
    }
  } catch {
    // Memory indexing is best-effort; don't fail archive
  }
}
