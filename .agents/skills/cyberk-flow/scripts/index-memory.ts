import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createMemoryStore } from "./lib/memory/index";

function ensureGitignore(projectRoot: string): void {
  const gitignorePath = `${projectRoot}/.gitignore`;
  const pattern = "cyberk-flow/memory.db*";

  if (existsSync(gitignorePath)) {
    const content = readFileSync(gitignorePath, "utf-8");
    if (content.includes(pattern)) return;
    writeFileSync(gitignorePath, `${content.trimEnd()}\n${pattern}\n`, "utf-8");
  } else {
    writeFileSync(gitignorePath, `${pattern}\n`, "utf-8");
  }
}

if (import.meta.main) {
  const projectRoot = process.cwd();
  ensureGitignore(projectRoot);

  const store = createMemoryStore(projectRoot);
  try {
    const summary = await store.index();
    console.log(
      `Indexed: ${summary.added} new, ${summary.updated} updated, ${summary.removed} removed, ${summary.unchanged} unchanged`,
    );
  } finally {
    store.close();
  }
}
