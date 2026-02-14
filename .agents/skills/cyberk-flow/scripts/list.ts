import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const TASK_PATTERN = /^[-*]\s+\[[\sx]\]/i;
const COMPLETED_TASK_PATTERN = /^[-*]\s+\[x\]/i;
const REQUIREMENT_HEADER = /^###\s+Requirement:\s+/;

export interface TaskProgress {
  total: number;
  completed: number;
}

export function countTasks(content: string): TaskProgress {
  let total = 0;
  let completed = 0;
  for (const line of content.split("\n")) {
    if (TASK_PATTERN.test(line)) {
      total++;
      if (COMPLETED_TASK_PATTERN.test(line)) {
        completed++;
      }
    }
  }
  return { total, completed };
}

export function formatStatus(p: TaskProgress): string {
  if (p.total === 0) return "No tasks";
  if (p.completed === p.total) return `✓ ${p.total}/${p.total}`;
  return `${p.completed}/${p.total} tasks`;
}

export interface ChangeInfo {
  name: string;
  progress: TaskProgress;
}

export function listChanges(projectRoot: string): ChangeInfo[] {
  const changesDir = join(projectRoot, "cyberk-flow", "changes");
  if (!existsSync(changesDir)) return [];

  const results: ChangeInfo[] = [];
  for (const entry of readdirSync(changesDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "archive") continue;
    const tasksPath = join(changesDir, entry.name, "tasks.md");
    let progress: TaskProgress = { total: 0, completed: 0 };
    if (existsSync(tasksPath)) {
      progress = countTasks(readFileSync(tasksPath, "utf-8"));
    }
    results.push({ name: entry.name, progress });
  }
  return results;
}

export interface SpecInfo {
  name: string;
  requirements: number;
}

export function listSpecs(projectRoot: string): SpecInfo[] {
  const specsDir = join(projectRoot, "cyberk-flow", "specs");
  if (!existsSync(specsDir)) return [];

  const results: SpecInfo[] = [];
  for (const entry of readdirSync(specsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const specPath = join(specsDir, entry.name, "spec.md");
    let requirements = 0;
    if (existsSync(specPath)) {
      const content = readFileSync(specPath, "utf-8");
      for (const line of content.split("\n")) {
        if (REQUIREMENT_HEADER.test(line)) requirements++;
      }
    }
    results.push({ name: entry.name, requirements });
  }
  return results;
}

if (import.meta.main) {
  const mode = process.argv[2];

  if (!mode || !["changes", "specs"].includes(mode)) {
    console.error("Usage: bun run list.ts <changes|specs>");
    process.exit(1);
  }

  if (mode === "changes") {
    const changes = listChanges(".");
    if (changes.length === 0) {
      console.log("No active changes.");
    } else {
      const nameWidth = Math.max(...changes.map((c) => c.name.length));
      for (const c of changes) {
        console.log(`  ${c.name.padEnd(nameWidth)}   ${formatStatus(c.progress)}`);
      }
    }
  } else {
    const specs = listSpecs(".");
    if (specs.length === 0) {
      console.log("No specs.");
    } else {
      const nameWidth = Math.max(...specs.map((s) => s.name.length));
      for (const s of specs) {
        console.log(`  ${s.name.padEnd(nameWidth)}   ${s.requirements} requirement(s)`);
      }
    }
  }
}
