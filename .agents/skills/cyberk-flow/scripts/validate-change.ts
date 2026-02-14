import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import type { DeltaPlan, RequirementBlock } from "./lib/parse-delta.js";
import { normalizeRequirementName, parseDeltaSpec } from "./lib/parse-delta.js";

export type { DeltaPlan, RequirementBlock };
export { parseDeltaSpec };

export interface ValidationIssue {
  level: "ERROR" | "WARNING";
  specFile: string;
  message: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
  errors: number;
  warnings: number;
}

function findSpecFiles(changeDir: string): string[] {
  const specsDir = join(changeDir, "specs");
  if (!existsSync(specsDir)) return [];

  const specFiles: string[] = [];
  for (const entry of readdirSync(specsDir)) {
    const specPath = join(specsDir, entry, "spec.md");
    if (existsSync(specPath) && statSync(specPath).isFile()) {
      specFiles.push(specPath);
    }
  }
  return specFiles;
}

function checkDuplicates(items: { name: string }[], sectionLabel: string, specFile: string, issues: ValidationIssue[]) {
  const seen = new Set<string>();
  for (const item of items) {
    const normalized = normalizeRequirementName(item.name);
    if (seen.has(normalized)) {
      issues.push({ level: "ERROR", specFile, message: `Duplicate requirement "${item.name}" in ${sectionLabel}` });
    }
    seen.add(normalized);
  }
}

export function validateChange(changeDir: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!existsSync(changeDir)) {
    issues.push({ level: "ERROR", specFile: changeDir, message: "Change directory does not exist" });
    return { issues, errors: 1, warnings: 0 };
  }

  const specFiles = findSpecFiles(changeDir);
  if (specFiles.length === 0) {
    issues.push({ level: "ERROR", specFile: changeDir, message: "No spec files found" });
    return { issues, errors: 1, warnings: 0 };
  }

  let totalDeltas = 0;

  for (const specFile of specFiles) {
    const content = readFileSync(specFile, "utf-8");
    const delta = parseDeltaSpec(content);

    totalDeltas += delta.added.length + delta.modified.length + delta.removed.length + delta.renamed.length;

    for (const req of [...delta.added, ...delta.modified]) {
      if (!/\b(SHALL|MUST)\b/.test(req.raw)) {
        issues.push({ level: "ERROR", specFile, message: `Requirement "${req.name}" missing SHALL or MUST keyword` });
      }
    }

    for (const req of [...delta.added, ...delta.modified]) {
      if (!/^####\s+/gm.test(req.raw)) {
        issues.push({ level: "ERROR", specFile, message: `Requirement "${req.name}" missing scenario (#### heading)` });
      }
    }

    checkDuplicates(delta.added, "ADDED Requirements", specFile, issues);
    checkDuplicates(delta.modified, "MODIFIED Requirements", specFile, issues);

    const removedDups = new Set<string>();
    for (const name of delta.removed) {
      const normalized = normalizeRequirementName(name);
      if (removedDups.has(normalized)) {
        issues.push({ level: "ERROR", specFile, message: `Duplicate requirement "${name}" in REMOVED Requirements` });
      }
      removedDups.add(normalized);
    }

    const addedNames = new Set(delta.added.map((r) => normalizeRequirementName(r.name)));
    const modifiedNames = new Set(delta.modified.map((r) => normalizeRequirementName(r.name)));
    const removedNames = new Set(delta.removed.map((r) => normalizeRequirementName(r)));

    for (const req of delta.added) {
      const name = normalizeRequirementName(req.name);
      if (removedNames.has(name)) {
        issues.push({
          level: "ERROR",
          specFile,
          message: `Requirement "${req.name}" appears in both ADDED and REMOVED`,
        });
      }
      if (modifiedNames.has(name)) {
        issues.push({
          level: "ERROR",
          specFile,
          message: `Requirement "${req.name}" appears in both ADDED and MODIFIED`,
        });
      }
    }
    for (const req of delta.modified) {
      const name = normalizeRequirementName(req.name);
      if (removedNames.has(name)) {
        issues.push({
          level: "ERROR",
          specFile,
          message: `Requirement "${req.name}" appears in both MODIFIED and REMOVED`,
        });
      }
    }

    const fromNames = new Set<string>();
    const toNames = new Set<string>();
    for (const pair of delta.renamed) {
      const normFrom = normalizeRequirementName(pair.from);
      const normTo = normalizeRequirementName(pair.to);
      if (normFrom === normTo) {
        issues.push({ level: "ERROR", specFile, message: `RENAMED pair has identical FROM and TO: "${pair.from}"` });
      }
      if (fromNames.has(normFrom)) {
        issues.push({ level: "ERROR", specFile, message: `Duplicate RENAMED FROM: "${pair.from}"` });
      }
      fromNames.add(normFrom);
      if (toNames.has(normTo)) {
        issues.push({ level: "ERROR", specFile, message: `Duplicate RENAMED TO: "${pair.to}"` });
      }
      toNames.add(normTo);
    }

    // RENAMED + MODIFIED interplay: MODIFIED must reference new name, not old
    for (const req of delta.modified) {
      const name = normalizeRequirementName(req.name);
      if (fromNames.has(name)) {
        issues.push({
          level: "ERROR",
          specFile,
          message: `Requirement "${req.name}" is RENAMED — MODIFIED must reference the new name, not the old`,
        });
      }
    }

    // ADDED must not collide with RENAMED TO target
    for (const req of delta.added) {
      const name = normalizeRequirementName(req.name);
      if (toNames.has(name)) {
        issues.push({ level: "ERROR", specFile, message: `ADDED "${req.name}" collides with RENAMED TO target` });
      }
    }

    // NOTE: Orphaned FROM lines (a FROM without a matching TO) are silently
    // dropped by parseDeltaSpec and cannot be detected here. This is a known
    // limitation — the parser would need to surface orphans for validation.
  }

  if (totalDeltas === 0) {
    issues.push({ level: "ERROR", specFile: changeDir, message: "No deltas found across all spec files" });
  }

  const errors = issues.filter((i) => i.level === "ERROR").length;
  const warnings = issues.filter((i) => i.level === "WARNING").length;

  return { issues, errors, warnings };
}

if (import.meta.main) {
  const name = process.argv[2];
  if (!name) {
    console.error("Usage: bun run validate-change.ts <change-name>");
    process.exit(1);
  }

  const changeDir = join("cyberk-flow", "changes", name);
  if (!existsSync(changeDir)) {
    console.error(`Error: Change '${name}' not found at ${changeDir}`);
    process.exit(1);
  }

  const result = validateChange(changeDir);

  for (const issue of result.issues) {
    console.log(`${issue.level}: ${issue.specFile}: ${issue.message}`);
  }

  if (result.errors > 0) {
    console.log(`Validation: ${result.errors} error(s), ${result.warnings} warning(s)`);
    process.exit(1);
  } else if (result.warnings > 0) {
    console.log(`Validation: ${result.errors} error(s), ${result.warnings} warning(s)`);
  } else {
    console.log("Validation passed");
  }
}
