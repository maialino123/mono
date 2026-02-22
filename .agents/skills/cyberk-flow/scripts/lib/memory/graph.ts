import type { Database } from "bun:sqlite";

/**
 * Build an adjacency list from all documents in the database.
 * For each document, concatenates its chunks' content and extracts references.
 * Only includes edges to paths that exist in the documents table, excluding self-references.
 */
export function buildAdjacencyList(db: Database): Map<string, Set<string>> {
  const docs = db.prepare("SELECT id, path FROM documents").all() as { id: number; path: string }[];
  const docPaths = new Set(docs.map((d) => d.path));
  const adjacency = new Map<string, Set<string>>();

  // Initialize all docs as nodes (ensures isolated docs appear in PageRank)
  for (const doc of docs) {
    adjacency.set(doc.path, new Set());
  }

  for (const doc of docs) {
    const chunks = db
      .prepare("SELECT content FROM chunks WHERE doc_id = ? ORDER BY chunk_index")
      .all(doc.id) as { content: string }[];
    const fullContent = chunks.map((c) => c.content).join("\n");
    const refs = parseReferences(fullContent, doc.path);
    const validRefs = refs.filter((r) => docPaths.has(r) && r !== doc.path);
    for (const ref of validRefs) {
      adjacency.get(doc.path)!.add(ref);
    }
  }

  return adjacency;
}

/**
 * Compute PageRank scores using power iteration.
 * - Damping factor: 0.85
 * - Convergence threshold: 1e-6 (L1 norm)
 * - Max iterations: 50
 * - Dangling nodes distribute rank evenly across all nodes.
 */
export function computePageRank(adjacency: Map<string, Set<string>>): Map<string, number> {
  const allNodes = new Set<string>();
  for (const [src, targets] of adjacency) {
    allNodes.add(src);
    for (const t of targets) {
      allNodes.add(t);
    }
  }

  const N = allNodes.size;
  if (N === 0) return new Map();

  const nodes = [...allNodes];
  const d = 0.85;
  const threshold = 1e-6;
  const maxIterations = 50;

  let rank = new Map<string, number>();
  for (const node of nodes) {
    rank.set(node, 1 / N);
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    const newRank = new Map<string, number>();
    for (const node of nodes) {
      newRank.set(node, 0);
    }

    let danglingSum = 0;
    for (const node of nodes) {
      const outLinks = adjacency.get(node);
      if (!outLinks || outLinks.size === 0) {
        danglingSum += rank.get(node)!;
      } else {
        const share = rank.get(node)! / outLinks.size;
        for (const target of outLinks) {
          newRank.set(target, newRank.get(target)! + share);
        }
      }
    }

    const danglingContribution = danglingSum / N;
    let l1Diff = 0;
    for (const node of nodes) {
      const score = (1 - d) / N + d * (newRank.get(node)! + danglingContribution);
      newRank.set(node, score);
      l1Diff += Math.abs(score - rank.get(node)!);
    }

    rank = newRank;
    if (l1Diff < threshold) break;
  }

  return rank;
}

/**
 * Write PageRank scores to the documents.pagerank column in a single transaction.
 */
export function updatePageRanks(db: Database, ranks: Map<string, number>): void {
  const update = db.prepare("UPDATE documents SET pagerank = ? WHERE path = ?");
  const txn = db.transaction(() => {
    // Reset all pageranks first to avoid stale values from removed references
    db.run("UPDATE documents SET pagerank = 0.0");
    for (const [path, score] of ranks) {
      update.run(score, path);
    }
  });
  txn();
}

/**
 * Extract target document paths from markdown content.
 * Returns deduplicated paths, excluding self-references and external URLs.
 */
export function parseReferences(content: string, sourcePath: string): string[] {
  const refs = new Set<string>();

  // Pattern 1: Markdown links [text](path)
  const mdLinkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
  for (const match of content.matchAll(mdLinkRe)) {
    const target = match[2].trim();
    if (!isExternal(target)) {
      addRef(refs, target, sourcePath);
    }
  }

  // Pattern 2: Bare spec mentions specs/<name> (not already inside a markdown link)
  // Match specs/<name> where <name> is a path-safe identifier
  const bareSpecRe = /(?<!\()\bspecs\/([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)*)\b/g;
  for (const match of content.matchAll(bareSpecRe)) {
    const specFragment = match[1];
    // If the match already looks like a full path (contains spec.md), use as-is with prefix
    const target = specFragment.endsWith("spec.md")
      ? `cyberk-flow/specs/${specFragment}`
      : `cyberk-flow/specs/${specFragment}/spec.md`;
    addRef(refs, target, sourcePath);
  }

  // Pattern 3: Ref lines — Refs: name1, name2
  const refsLineRe = /^Refs:\s*(.+)$/gm;
  for (const match of content.matchAll(refsLineRe)) {
    const names = match[1].split(",").map((n) => n.trim()).filter(Boolean);
    for (const name of names) {
      const target = `cyberk-flow/specs/${name}/spec.md`;
      addRef(refs, target, sourcePath);
    }
  }

  return [...refs];
}

function isExternal(path: string): boolean {
  return path.startsWith("http://") || path.startsWith("https://") || path.startsWith("#");
}

function normalizePath(p: string): string {
  let normalized = p;
  // Remove leading ./
  while (normalized.startsWith("./")) {
    normalized = normalized.slice(2);
  }
  // Remove trailing /
  while (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

function addRef(refs: Set<string>, target: string, sourcePath: string): void {
  const normalized = normalizePath(target);
  if (normalized && normalized !== normalizePath(sourcePath)) {
    refs.add(normalized);
  }
}
