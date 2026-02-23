import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { checkContradictions } from "./lib/memory/contradiction.ts";
import { runHook } from "./lib/hooks.ts";
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

  // Test evidence: behavior-changing tasks must declare test intent
  const tasksPath = join(changeDir, "tasks.md");
  if (totalDeltas > 0 && !existsSync(tasksPath)) {
    issues.push({
      level: "ERROR",
      specFile: changeDir,
      message: "Spec has behavior changes but tasks.md is missing — tasks.md is required for changes with spec deltas",
    });
  }
  if (totalDeltas > 0 && existsSync(tasksPath)) {
    const tasksContent = readFileSync(tasksPath, "utf-8");
    // Match task lines like "- [ ] 1_1 ..." or "- [x] 2_3 ..."
    const taskPattern = /^\s*-\s*\[[\sx ]\]\s*(\d+_\d+)\b/gm;
    let taskMatch: RegExpExecArray | null;
    const taskIds: string[] = [];
    while ((taskMatch = taskPattern.exec(tasksContent)) !== null) {
      // Skip spike tasks (0_x)
      if (!taskMatch[1].startsWith("0_")) {
        taskIds.push(taskMatch[1]);
      }
    }

    if (taskIds.length > 0) {
      // Check if any non-spike task has a **Test** field
      const hasTestField = /^\s*-\s*\*\*Test\*\*\s*:/m.test(tasksContent);
      if (!hasTestField) {
        issues.push({
          level: "ERROR",
          specFile: tasksPath,
          message:
            "Spec has behavior changes but tasks.md has no **Test** field — every behavior-changing task must declare test evidence (file path + type) or N/A with justification",
        });
      } else {
        // Check that all non-N/A Test fields have actual content (not just template comments)
        const testFieldPattern = /^\s*-\s*\*\*Test\*\*\s*:\s*(.*)$/gm;
        let testMatch: RegExpExecArray | null;
        let hasRealTest = false;
        let allNA = true;
        let hasNAWithoutReason = false;
        while ((testMatch = testFieldPattern.exec(tasksContent)) !== null) {
          const value = testMatch[1].trim();
          // Skip empty or template-only values (just HTML comments)
          if (!value || /^<!--.*-->$/.test(value)) continue;
          if (/^N\/A\b/i.test(value)) {
            // N/A must include a reason after the dash
            if (!/^N\/A\s*[—–-]\s*\S/i.test(value)) {
              hasNAWithoutReason = true;
            }
          } else {
            hasRealTest = true;
            allNA = false;
          }
        }
        if (hasNAWithoutReason) {
          issues.push({
            level: "ERROR",
            specFile: tasksPath,
            message:
              "Test field declares N/A without justification — use format: N/A — <reason> (e.g., N/A — config-only change)",
          });
        }
        if (allNA && taskIds.length > 0) {
          issues.push({
            level: "WARNING",
            specFile: tasksPath,
            message:
              "All tasks declare Test as N/A — verify this is correct if spec has behavior-changing requirements",
          });
        }
      }
    }
  }

  // E2E consistency: proposal UI Impact vs tasks.md
  const proposalPath = join(changeDir, "proposal.md");
  if (existsSync(proposalPath)) {
    const proposalContent = readFileSync(proposalPath, "utf-8");
    const uiImpactMatch = proposalContent.match(/User-visible UI behavior affected\?\*{0,2}\s*(?:<!--\s*)?(YES|NO)/i);
    const e2eRequiredMatch = proposalContent.match(/E2E required\?\*{0,2}\s*(?:<!--\s*)?(REQUIRED|NOT REQUIRED)/i);

    if (!uiImpactMatch) {
      issues.push({
        level: "WARNING",
        specFile: proposalPath,
        message: "UI Impact & E2E section: 'User-visible UI behavior affected?' not filled (expected YES or NO)",
      });
    }
    if (uiImpactMatch && uiImpactMatch[1].toUpperCase() === "YES" && !e2eRequiredMatch) {
      issues.push({
        level: "ERROR",
        specFile: proposalPath,
        message: "UI Impact = YES but 'E2E required?' not filled (expected REQUIRED or NOT REQUIRED)",
      });
    }
    if (e2eRequiredMatch && e2eRequiredMatch[1].toUpperCase() === "REQUIRED" && existsSync(tasksPath)) {
      const tasksContent = readFileSync(tasksPath, "utf-8");
      const hasE2eTask = /^\s*-\s*\[[\sx]\]\s*.*\b(e2e|end[- ]to[- ]end|ui\s*test|playwright)\b/im.test(tasksContent);
      if (!hasE2eTask) {
        issues.push({
          level: "ERROR",
          specFile: tasksPath,
          message: "E2E is REQUIRED in proposal but tasks.md has no E2E task",
        });
      }
    }
  }

  const errors = issues.filter((i) => i.level === "ERROR").length;
  const warnings = issues.filter((i) => i.level === "WARNING").length;

  return { issues, errors, warnings };
}

export async function validateChangeWithContradictions(
  changeDir: string,
  specsDir?: string,
): Promise<ValidationResult> {
  const result = validateChange(changeDir);
  if (result.errors > 0) return result;

  const resolvedSpecsDir = specsDir ?? join(process.cwd(), "cyberk-flow", "specs");
  const contradictions = await checkContradictions(changeDir, resolvedSpecsDir);

  for (const c of contradictions) {
    if (c.level === "allow") continue;
    const level = c.level === "reject" ? "ERROR" : "WARNING";
    const message = `Contradiction: "${c.source}" vs "${c.target}" (energy: ${c.energy.toFixed(2)}) — ${c.details}`;
    result.issues.push({ level, specFile: changeDir, message });
  }

  result.errors = result.issues.filter((i) => i.level === "ERROR").length;
  result.warnings = result.issues.filter((i) => i.level === "WARNING").length;

  return result;
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

  if (!runHook("pre-validate-change", [name])) process.exit(1);

  const result = await validateChangeWithContradictions(changeDir);

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

  runHook("post-validate-change", [name]);
}
