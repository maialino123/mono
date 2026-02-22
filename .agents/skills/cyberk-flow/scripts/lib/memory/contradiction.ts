import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseDeltaSpec } from "../parse-delta";
import type { Contradiction } from "./types";

export const ANTONYM_PAIRS: [string, string][] = [
  ["must", "never"],
  ["always", "don't"],
  ["enable", "disable"],
  ["allow", "deny"],
  ["require", "forbid"],
  ["include", "exclude"],
  ["add", "remove"],
];

export function jaccardSimilarity(textA: string, textB: string): number {
  const tokensA = new Set(textA.toLowerCase().split(/\W+/).filter(Boolean));
  const tokensB = new Set(textB.toLowerCase().split(/\W+/).filter(Boolean));
  const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

export function antonymScore(textA: string, textB: string): number {
  const lowerA = textA.toLowerCase();
  const lowerB = textB.toLowerCase();
  let matched = 0;

  for (const [a, b] of ANTONYM_PAIRS) {
    const wordBoundary = (word: string) => new RegExp(`\\b${word}\\b`);
    const aInA = wordBoundary(a).test(lowerA);
    const aInB = wordBoundary(a).test(lowerB);
    const bInA = wordBoundary(b).test(lowerA);
    const bInB = wordBoundary(b).test(lowerB);

    if ((aInA && bInB) || (bInA && aInB)) {
      matched++;
    }
  }

  return ANTONYM_PAIRS.length === 0 ? 0 : matched / ANTONYM_PAIRS.length;
}

export function computeCoherenceEnergy(
  antonymScore: number,
  semanticOverlap: number,
): { energy: number; level: "reject" | "warn" | "allow" } {
  const energy = antonymScore * 0.6 + semanticOverlap * 0.4;
  let level: "reject" | "warn" | "allow";

  if (energy >= 0.7) {
    level = "reject";
  } else if (energy >= 0.3) {
    level = "warn";
  } else {
    level = "allow";
  }

  return { energy, level };
}

function extractRequirementTexts(content: string): string[] {
  const texts: string[] = [];
  const lines = content.split("\n");
  let inReq = false;
  let currentLines: string[] = [];

  for (const line of lines) {
    if (/^###\s*Requirement:/.test(line)) {
      if (inReq && currentLines.length > 0) {
        texts.push(currentLines.join("\n"));
      }
      inReq = true;
      currentLines = [line];
    } else if (/^## /.test(line)) {
      if (inReq && currentLines.length > 0) {
        texts.push(currentLines.join("\n"));
      }
      inReq = false;
      currentLines = [];
    } else if (inReq) {
      currentLines.push(line);
    }
  }

  if (inReq && currentLines.length > 0) {
    texts.push(currentLines.join("\n"));
  }

  return texts;
}

export async function checkContradictions(
  changePath: string,
  specsDir: string,
): Promise<Contradiction[]> {
  const contradictions: Contradiction[] = [];
  const deltaSpecsDir = join(changePath, "specs");

  if (!existsSync(deltaSpecsDir)) {
    return contradictions;
  }

  const specDirs = readdirSync(deltaSpecsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const specName of specDirs) {
    const deltaSpecPath = join(deltaSpecsDir, specName, "spec.md");
    if (!existsSync(deltaSpecPath)) continue;

    const deltaContent = readFileSync(deltaSpecPath, "utf-8");
    const delta = parseDeltaSpec(deltaContent);

    const mainSpecPath = join(specsDir, specName, "spec.md");
    if (!existsSync(mainSpecPath)) continue;

    const mainContent = readFileSync(mainSpecPath, "utf-8");
    const mainReqTexts = extractRequirementTexts(mainContent);

    if (mainReqTexts.length === 0) continue;

    const requirements = [...delta.added, ...delta.modified];

    for (const req of requirements) {
      for (const mainReqText of mainReqTexts) {
        const aScore = antonymScore(req.raw, mainReqText);
        const overlap = jaccardSimilarity(req.raw, mainReqText);
        const { energy, level } = computeCoherenceEnergy(aScore, overlap);

        if (level !== "allow") {
          contradictions.push({
            source: `${specName}/delta:${req.name}`,
            target: `${specName}/spec`,
            energy,
            level,
            details: `antonym=${aScore.toFixed(2)} overlap=${overlap.toFixed(2)}`,
          });
        }
      }
    }
  }

  contradictions.sort((a, b) => b.energy - a.energy);
  return contradictions;
}
