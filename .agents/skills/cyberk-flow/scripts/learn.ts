import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createMemoryStore } from "./lib/memory/index";

const CATEGORIES = ["decisions", "debugging", "patterns", "research", "conventions"] as const;
type Category = (typeof CATEGORIES)[number];

interface LearnArgs {
  title: string;
  summary: string;
  body?: string;
  category: Category;
  source: string;
  labels: string[];
  action: "create" | "update" | "skip";
  expires?: number;
}

function normalizeLabel(l: string): string {
  return l
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function sanitizeFrontmatterValue(v: string): string {
  return v
    .replace(/[\r\n]+/g, " ")
    .replace(/---/g, "--")
    .trim();
}

export function deriveSummary(body: string): string {
  let inCodeBlock = false;
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("---")) continue;
    const clean = trimmed
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^\s*[-*+]\s+/, "")
      .trim();
    if (clean.length > 0) {
      return clean.length > 200 ? clean.slice(0, 197) + "..." : clean;
    }
  }
  return "";
}

function parseArgs(args: string[], stdinBody?: string): LearnArgs {
  const positional: string[] = [];
  let summary = "";
  let category = "";
  let source = "manual";
  let labels: string[] = [];
  let action: "create" | "update" | "skip" = "create";
  let expires: number | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--summary" && i + 1 < args.length) {
      summary = args[++i].replace(/\\n/g, "\n");
    } else if (args[i] === "--category" && i + 1 < args.length) {
      category = args[++i];
    } else if (args[i] === "--source" && i + 1 < args.length) {
      source = args[++i];
    } else if (args[i] === "--labels" && i + 1 < args.length) {
      labels = args[++i]
        .split(",")
        .map((l) => normalizeLabel(l))
        .filter(Boolean);
    } else if (args[i] === "--action" && i + 1 < args.length) {
      action = args[++i] as "create" | "update" | "skip";
    } else if (args[i] === "--expires" && i + 1 < args.length) {
      expires = parseInt(args[++i], 10);
    } else {
      positional.push(args[i]);
    }
  }

  const title = positional.join(" ");
  const body = stdinBody || undefined;

  if (!title) {
    console.error("Error: title is required (positional argument)");
    process.exit(1);
  }
  if (!body && !summary) {
    console.error("Error: --summary is required when no stdin body is provided");
    process.exit(1);
  }
  if (body && !summary) {
    summary = deriveSummary(body);
  }
  if (!category || !CATEGORIES.includes(category as Category)) {
    console.error(`Error: --category must be one of: ${CATEGORIES.join(", ")}`);
    process.exit(1);
  }
  if (!["create", "update", "skip"].includes(action)) {
    console.error("Error: --action must be one of: create, update, skip");
    process.exit(1);
  }
  if (expires !== undefined && (!Number.isFinite(expires) || !Number.isInteger(expires) || expires < 0)) {
    console.error("Error: --expires must be a non-negative integer (days)");
    process.exit(1);
  }

  return {
    title,
    summary,
    body,
    category: category as Category,
    source: sanitizeFrontmatterValue(source),
    labels: [...new Set(labels)],
    action,
    expires,
  };
}

export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function toYYMMDD(date: Date): string {
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

function toYYYYMMDD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(date: Date): string {
  return toYYYYMMDD(date);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const fm: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return fm;
}

export function findBySource(knowledgeDir: string, source: string): string | null {
  for (const cat of CATEGORIES) {
    const catDir = join(knowledgeDir, cat);
    if (!existsSync(catDir)) continue;
    for (const file of readdirSync(catDir)) {
      if (!file.endsWith(".md")) continue;
      const content = readFileSync(join(catDir, file), "utf-8");
      const fm = parseFrontmatter(content);
      if (fm.source === source) {
        return join(catDir, file);
      }
    }
  }
  return null;
}

export function findBySlug(targetDir: string, slug: string): string | null {
  if (!existsSync(targetDir)) return null;
  for (const file of readdirSync(targetDir)) {
    if (!file.endsWith(".md")) continue;
    const name = file.replace(/\.md$/, "");
    const slugPart = name.replace(/^\d{6}-/, "");
    if (slugPart === slug) {
      return join(targetDir, file);
    }
  }
  return null;
}

function buildFrontmatter(args: LearnArgs, today: Date, existingExpires?: string, isUpdate?: boolean): string {
  const lines: string[] = ["---"];

  if (args.labels.length > 0) {
    lines.push(`labels: [${args.labels.join(", ")}]`);
  }
  lines.push(`source: ${args.source}`);
  if (args.summary) {
    lines.push(`summary: ${sanitizeFrontmatterValue(args.summary)}`);
  }

  let expiresDate: string | undefined;
  if (args.expires !== undefined) {
    expiresDate = formatDate(addDays(today, args.expires));
  } else if (args.category === "research") {
    expiresDate = formatDate(addDays(today, 14));
  }
  if (expiresDate) {
    lines.push(`expires: ${expiresDate}`);
  } else if (isUpdate && existingExpires) {
    lines.push(`expires: ${existingExpires}`);
  }

  if (isUpdate) {
    lines.push(`updated: ${formatDate(today)}`);
  }

  lines.push("---");
  return lines.join("\n");
}

export function buildFileContent(args: LearnArgs, today: Date, existingExpires?: string, isUpdate?: boolean): string {
  const frontmatter = buildFrontmatter(args, today, existingExpires, isUpdate);
  const content = args.body || args.summary;
  return `${frontmatter}\n# ${args.title}\n**Date**: ${formatDate(today)}\n\n${content}\n`;
}

function readStdin(): string | undefined {
  if (process.stdin.isTTY) return undefined;
  const content = readFileSync(0, "utf-8").trim();
  return content || undefined;
}

if (import.meta.main) {
  const stdinBody = readStdin();
  const args = parseArgs(process.argv.slice(2), stdinBody);
  const today = new Date();
  const projectRoot = process.cwd();
  const knowledgeDir = join(projectRoot, "cyberk-flow", "knowledge");
  const targetDir = join(knowledgeDir, args.category);
  const slug = toSlug(args.title);
  const prefix = toYYMMDD(today);
  const filename = `${prefix}-${slug}.md`;

  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Match by slug only — source is provenance metadata, not a unique key
  const matchedFile: string | null = findBySlug(targetDir, slug);

  if (matchedFile) {
    if (args.action === "create") {
      console.log(`Skipped: '${args.title}' already exists. Use --action update to overwrite.`);
      process.exit(0);
    }
    if (args.action === "skip") {
      console.log("Skipped");
      process.exit(0);
    }
    // action === "update"
    const existingContent = readFileSync(matchedFile, "utf-8");
    const existingFm = parseFrontmatter(existingContent);
    const dateMatch = existingContent.match(/\*\*Date\*\*:\s*(\S+)/);
    const originalDate = dateMatch ? dateMatch[1] : formatDate(today);
    const frontmatter = buildFrontmatter(args, today, existingFm.expires, true);
    const bodyContent = args.body || args.summary;
    const content = `${frontmatter}\n# ${args.title}\n**Date**: ${originalDate}\n\n${bodyContent}\n`;
    writeFileSync(matchedFile, content, "utf-8");

    // Re-index
    const indexStore = createMemoryStore(projectRoot);
    try {
      await indexStore.index();
    } finally {
      indexStore.close();
    }

    console.log(`Updated: ${args.title} in ${args.category}/`);
    process.exit(0);
  }

  // No match — create new file
  const filePath = join(targetDir, filename);
  const content = buildFileContent(args, today);
  writeFileSync(filePath, content, "utf-8");

  // Re-index
  const indexStore = createMemoryStore(projectRoot);
  try {
    await indexStore.index();
  } finally {
    indexStore.close();
  }

  console.log(`Created: ${args.title} in ${args.category}/`);
}
