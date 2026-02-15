import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  extractRequirementsSection,
  normalizeRequirementName,
  parseDeltaSpec,
  type RequirementBlock,
} from "./lib/parse-delta";

function tickApplyDeltasCheckbox(workflowPath: string) {
  if (!existsSync(workflowPath)) return;
  const content = readFileSync(workflowPath, "utf-8");
  const re = /^(\s*-\s*\[)\s(\]\s+Apply deltas:.*)$/m;
  const updated = content.replace(re, "$1x$2");
  if (updated !== content) {
    writeFileSync(workflowPath, updated, "utf-8");
  }
}

export function applyDeltasToSpec(
  deltaContent: string,
  mainContent: string | null,
  capability: string,
): { output: string; summary: string } {
  const delta = parseDeltaSpec(deltaContent);
  const isNewSpec = mainContent === null;

  if (isNewSpec && (delta.modified.length > 0 || delta.renamed.length > 0)) {
    throw new Error(
      `${capability}: Cannot MODIFY or RENAME requirements in a new spec (no existing spec found). Only ADDED is allowed.`,
    );
  }

  const specContent = mainContent ?? `# ${capability} Specification\n\n## Purpose\nTBD\n\n## Requirements\n`;

  const parts = extractRequirementsSection(specContent);

  if (!parts.headerLine) {
    throw new Error(`${capability}: No '## Requirements' section found in spec.`);
  }

  const blockMap = new Map<string, RequirementBlock>();
  const blockOrder: string[] = [];
  for (const block of parts.bodyBlocks) {
    const key = normalizeRequirementName(block.name);
    blockMap.set(key, block);
    blockOrder.push(key);
  }

  checkConflicts(delta, blockMap, capability, isNewSpec);

  const errors: string[] = [];

  let renamedCount = 0;
  for (const { from, to } of delta.renamed) {
    const fromKey = normalizeRequirementName(from);
    const toKey = normalizeRequirementName(to);
    const block = blockMap.get(fromKey);
    if (!block) {
      errors.push(`${capability}: RENAMED FROM "${from}" not found`);
      continue;
    }
    const updatedRaw = block.raw.replace(/^(### Requirement:\s*).+/m, `$1${to}`);
    blockMap.delete(fromKey);
    blockMap.set(toKey, { name: to, raw: updatedRaw });
    const idx = blockOrder.indexOf(fromKey);
    if (idx !== -1) blockOrder[idx] = toKey;
    renamedCount++;
  }

  let removedCount = 0;
  for (const name of delta.removed) {
    const key = normalizeRequirementName(name);
    if (isNewSpec) {
      console.warn(`${capability}: REMOVED '${name}' ignored (new spec has no existing requirements)`);
      continue;
    }
    blockMap.delete(key);
    const idx = blockOrder.indexOf(key);
    if (idx !== -1) blockOrder.splice(idx, 1);
    removedCount++;
  }

  let modifiedCount = 0;
  for (const block of delta.modified) {
    const key = normalizeRequirementName(block.name);
    blockMap.set(key, block);
    modifiedCount++;
  }

  let addedCount = 0;
  for (const block of delta.added) {
    const key = normalizeRequirementName(block.name);
    blockMap.set(key, block);
    blockOrder.push(key);
    addedCount++;
  }

  const rebuiltBlocks: string[] = [];
  for (const key of blockOrder) {
    const block = blockMap.get(key);
    if (block) {
      rebuiltBlocks.push(block.raw);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  const blockText = rebuiltBlocks.length > 0 ? rebuiltBlocks.join("\n") : "";
  const preambleStr = parts.preamble.trim() ? `\n${parts.preamble.trimEnd()}\n\n` : "\n\n";
  const result = `${parts.before.trimEnd()}\n${parts.headerLine}${preambleStr}${blockText}\n${parts.after}`.replace(
    /\n{3,}/g,
    "\n\n",
  );

  const summary = `${capability}: +${addedCount} ~${modifiedCount} -${removedCount} →${renamedCount}`;
  return { output: result, summary };
}

function checkConflicts(
  delta: ReturnType<typeof parseDeltaSpec>,
  blockMap: Map<string, RequirementBlock>,
  capability: string,
  isNewSpec: boolean,
): void {
  const modifiedNames = new Set(delta.modified.map((b) => normalizeRequirementName(b.name)));
  const removedNames = new Set(delta.removed.map((n) => normalizeRequirementName(n)));

  for (const name of modifiedNames) {
    if (removedNames.has(name)) {
      throw new Error(`${capability}: Requirement '${name}' is in both MODIFIED and REMOVED.`);
    }
  }

  const renamedFroms = new Set<string>();
  const renamedTos = new Set<string>();
  for (const { from, to } of delta.renamed) {
    const fromKey = normalizeRequirementName(from);
    const toKey = normalizeRequirementName(to);
    if (renamedFroms.has(fromKey)) {
      throw new Error(`${capability}: Duplicate RENAMED FROM: "${from}"`);
    }
    renamedFroms.add(fromKey);
    if (renamedTos.has(toKey)) {
      throw new Error(`${capability}: Duplicate RENAMED TO: "${to}"`);
    }
    renamedTos.add(toKey);
  }

  for (const { to } of delta.renamed) {
    const toKey = normalizeRequirementName(to);
    if (blockMap.has(toKey)) {
      throw new Error(`${capability}: RENAMED TO '${to}' collides with existing requirement.`);
    }
  }

  for (const block of delta.added) {
    const key = normalizeRequirementName(block.name);
    if (blockMap.has(key)) {
      throw new Error(`${capability}: ADDED requirement '${block.name}' already exists.`);
    }
    if (renamedTos.has(key)) {
      throw new Error(`${capability}: ADDED '${block.name}' collides with RENAMED TO name.`);
    }
  }

  for (const block of delta.modified) {
    const key = normalizeRequirementName(block.name);
    if (!blockMap.has(key)) {
      throw new Error(`${capability}: MODIFIED requirement '${block.name}' not found in target spec.`);
    }
    if (renamedFroms.has(key)) {
      throw new Error(`${capability}: MODIFIED requirement '${block.name}' was RENAMED. Use the new name instead.`);
    }
  }

  for (const name of delta.removed) {
    const key = normalizeRequirementName(name);
    if (!blockMap.has(key) && !isNewSpec) {
      throw new Error(`${capability}: REMOVED requirement '${name}' not found in target spec.`);
    }
  }

  for (const { from } of delta.renamed) {
    const fromKey = normalizeRequirementName(from);
    if (!blockMap.has(fromKey)) {
      throw new Error(`${capability}: RENAMED FROM '${from}' not found in target spec.`);
    }
  }
}

function main() {
  const name = process.argv[2];
  if (!name) {
    console.error("Usage: bun run apply-deltas.ts <change-name>");
    process.exit(1);
  }

  const changeSpecsDir = join("cyberk-flow", "changes", name, "specs");
  if (!existsSync(changeSpecsDir)) {
    console.error(`Error: Change '${name}' has no specs/ directory at ${changeSpecsDir}`);
    process.exit(1);
  }

  const capabilities = readdirSync(changeSpecsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (capabilities.length === 0) {
    console.error(`Error: No capability directories found under ${changeSpecsDir}`);
    process.exit(1);
  }

  const summaries: string[] = [];
  const results: Array<{ path: string; content: string }> = [];

  for (const capability of capabilities) {
    const deltaPath = join(changeSpecsDir, capability, "spec.md");
    if (!existsSync(deltaPath)) continue;

    const deltaContent = readFileSync(deltaPath, "utf-8");
    const mainSpecPath = join("cyberk-flow", "specs", capability, "spec.md");
    const mainContent = existsSync(mainSpecPath) ? readFileSync(mainSpecPath, "utf-8") : null;

    try {
      const { output, summary } = applyDeltasToSpec(deltaContent, mainContent, capability);
      summaries.push(summary);
      results.push({ path: mainSpecPath, content: output });
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  }

  for (const { path, content } of results) {
    const dir = join(path, "..");
    mkdirSync(dir, { recursive: true });
    writeFileSync(path, content);
  }

  for (const s of summaries) {
    console.log(s);
  }
  console.log(`Applied deltas to ${summaries.length} spec(s)`);

  const workflowPath = join("cyberk-flow", "changes", name, "workflow.md");
  tickApplyDeltasCheckbox(workflowPath);
}

if (import.meta.main) {
  main();
}
