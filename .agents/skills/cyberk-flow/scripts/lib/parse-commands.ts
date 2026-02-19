import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_MD = join("cyberk-flow", "project.md");

export interface ProjectCommands {
  typeCheck?: string;
  lint?: string;
  test?: string;
  e2e?: string;
}

/**
 * Parse the `## Commands` section from `cyberk-flow/project.md`.
 *
 * Expected format (bullet list with bold labels):
 *   - **Type check**: `bun run check-types`
 *   - **Lint**: `bun run check`
 *   - **Test**: `bun test`
 *   - **E2E** _(optional)_: `npx playwright test`
 */
export function parseProjectCommands(projectMdPath = PROJECT_MD): ProjectCommands {
  if (!existsSync(projectMdPath)) {
    throw new Error(`Project file not found: ${projectMdPath}\nRun \`bun run cf init\` first.`);
  }

  const content = readFileSync(projectMdPath, "utf-8").replace(/\r\n/g, "\n");
  const commands: ProjectCommands = {};

  // Find ## Commands section (handle start-of-file and no trailing newline)
  const headerMatch = content.match(/(^|\n)## Commands[^\n]*/);
  if (!headerMatch) {
    throw new Error(
      `No "## Commands" section found in ${projectMdPath}.\nAdd a Commands section with Type check, Lint, and Test commands.`,
    );
  }
  const afterHeader = (headerMatch.index ?? 0) + headerMatch[0].length;
  const nextH2 = content.indexOf("\n## ", afterHeader);
  const section = nextH2 === -1 ? content.slice(afterHeader) : content.slice(afterHeader, nextH2);

  // Normalize label for matching: "Type-check", "Typecheck", "Type check" → "type check"
  const normalizeLabel = (s: string) => s.toLowerCase().trim().replace(/[-_]+/g, " ").replace(/\s+/g, " ");

  // Parse each bullet: - **Label**: `command` or - **Label** _(...)_: `command`
  // Accepts both backtick-wrapped and plain text after colon
  const linePattern = /^-\s+\*\*(.+?)\*\*[^:]*:\s*(?:`([^`]+)`|(.+))$/gm;
  for (const match of section.matchAll(linePattern)) {
    const label = normalizeLabel(match[1]);
    const command = (match[2] ?? match[3] ?? "")
      .trim()
      .replace(/<!--.*?-->/, "")
      .trim();
    if (!command || /^n\/?a$/i.test(command)) continue;
    if (label === "type check" || label === "typecheck") commands.typeCheck = command;
    else if (label === "lint") commands.lint = command;
    else if (label === "test" || label === "tests" || label === "unit test") commands.test = command;
    else if (label === "e2e") commands.e2e = command;
  }

  return commands;
}

/**
 * Get the ordered list of verify commands to run.
 * Throws if required commands (lint, test) are missing. Type check is optional.
 */
export function getVerifyCommands(options: { includeE2e?: boolean } = {}): { label: string; command: string }[] {
  const commands = parseProjectCommands();
  const missing: string[] = [];

  if (!commands.lint) missing.push("Lint");
  if (!commands.test) missing.push("Test");

  if (missing.length > 0) {
    throw new Error(
      `Missing required commands in ${PROJECT_MD} § Commands: ${missing.join(", ")}.\n` +
        "Fill in the commands, e.g.:\n" +
        "  - **Lint**: `bun run check`\n" +
        "  - **Test**: `bun test`\n" +
        "  - **Type check** _(optional)_: `bun run check-types`",
    );
  }

  const result: { label: string; command: string }[] = [];
  if (commands.typeCheck) result.push({ label: "Type check", command: commands.typeCheck });
  result.push({ label: "Lint", command: commands.lint as string });
  result.push({ label: "Test", command: commands.test as string });

  if (options.includeE2e) {
    if (!commands.e2e) {
      throw new Error(`E2E requested but no E2E command found in ${PROJECT_MD} § Commands.`);
    }
    result.push({ label: "E2E", command: commands.e2e });
  }

  return result;
}
