import type { Chunk } from "./types";

const MAX_CHUNK_SIZE = 900;
const HEADING_RE = /^(#{1,3})\s+(.+)$/;

interface Section {
  heading: string | null;
  lines: string[];
}

function splitOnHeadings(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let current: Section = { heading: null, lines: [] };

  for (const line of lines) {
    const match = line.match(HEADING_RE);
    if (match) {
      if (current.lines.length > 0 || current.heading !== null) {
        sections.push(current);
      }
      current = { heading: match[2].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }

  if (current.lines.length > 0 || current.heading !== null) {
    sections.push(current);
  }

  return sections;
}

function splitOnBlankLines(text: string): string[] {
  return text.split(/\n\n+/).filter((p) => p.trim().length > 0);
}

function splitOnLines(text: string, maxSize: number): string[] {
  const lines = text.split("\n");
  const parts: string[] = [];
  let buf: string[] = [];
  let bufLen = 0;

  for (const line of lines) {
    if (line.length > maxSize) {
      if (buf.length > 0) {
        parts.push(buf.join("\n"));
        buf = [];
        bufLen = 0;
      }
      for (let i = 0; i < line.length; i += maxSize) {
        parts.push(line.slice(i, i + maxSize));
      }
      continue;
    }
    const lineLen = line.length + (buf.length > 0 ? 1 : 0);
    if (bufLen + lineLen > maxSize && buf.length > 0) {
      parts.push(buf.join("\n"));
      buf = [];
      bufLen = 0;
    }
    buf.push(line);
    bufLen += line.length + (buf.length > 1 ? 1 : 0);
  }

  if (buf.length > 0) {
    parts.push(buf.join("\n"));
  }

  return parts;
}

function splitContent(content: string, maxSize: number): string[] {
  if (content.length <= maxSize) return [content];

  const paragraphs = splitOnBlankLines(content);
  const result: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= maxSize) {
      result.push(para);
    } else {
      result.push(...splitOnLines(para, maxSize));
    }
  }

  return result;
}

export function chunkMarkdown(text: string): Chunk[] {
  if (!text.trim()) return [];

  const sections = splitOnHeadings(text);
  const chunks: Chunk[] = [];
  let index = 0;

  for (const section of sections) {
    const sectionText = section.lines.join("\n").trim();
    if (!sectionText) continue;

    const parts = splitContent(sectionText, MAX_CHUNK_SIZE);

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      chunks.push({
        index: index++,
        heading: section.heading,
        content: trimmed,
      });
    }
  }

  return chunks;
}
