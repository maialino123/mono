import { createMemoryStore } from "./lib/memory/index";
import type { SearchMode, SearchResult } from "./lib/memory/types";

function parseArgs(args: string[]): { query: string; mode: SearchMode; limit: number; json: boolean } {
  let mode: SearchMode = "hybrid";
  let limit = 10;
  let json = false;
  const queryParts: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--mode" && i + 1 < args.length) {
      mode = args[++i] as SearchMode;
    } else if (args[i] === "--limit" && i + 1 < args.length) {
      limit = parseInt(args[++i], 10);
    } else if (args[i] === "--json") {
      json = true;
    } else {
      queryParts.push(args[i]);
    }
  }

  return { query: queryParts.join(" "), mode, limit, json };
}

function formatResult(r: SearchResult, i: number): string {
  const snippet = r.content.length > 200 ? `${r.content.slice(0, 200)}...` : r.content;
  const heading = r.heading ? ` > ${r.heading}` : "";
  return `${i + 1}. [${r.score.toFixed(3)}] ${r.path}${heading}\n   ${snippet}`;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const { query, mode, limit, json } = parseArgs(args);

  if (!query) {
    console.error("Usage: bun run cf search <query> [--mode keyword|vector|hybrid] [--limit N] [--json]");
    process.exit(1);
  }

  const projectRoot = process.cwd();
  const store = createMemoryStore(projectRoot);

  try {
    const results = await store.search(query, { mode, limit });

    if (json) {
      console.log(JSON.stringify(results, null, 2));
    } else if (results.length === 0) {
      console.log("No results found.");
    } else {
      for (let i = 0; i < results.length; i++) {
        console.log(formatResult(results[i], i));
      }
    }
  } finally {
    store.close();
  }
}
