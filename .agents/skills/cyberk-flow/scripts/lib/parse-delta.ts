export interface RequirementBlock {
  name: string;
  raw: string;
}

export interface DeltaPlan {
  added: RequirementBlock[];
  modified: RequirementBlock[];
  removed: string[];
  renamed: Array<{ from: string; to: string }>;
  sectionPresence: {
    added: boolean;
    modified: boolean;
    removed: boolean;
    renamed: boolean;
  };
}

export interface RequirementsSectionParts {
  before: string;
  headerLine: string;
  preamble: string;
  bodyBlocks: RequirementBlock[];
  after: string;
}

// Fix #1: trim-only, NOT lowercase (case-sensitive names)
export function normalizeRequirementName(name: string): string {
  return name.trim();
}

// Fix #2: CRLF normalization helper
function normalizeLineEndings(s: string): string {
  return s.replace(/\r\n?/g, "\n");
}

function splitSections(content: string): Array<{ title: string; body: string }> {
  const sections: Array<{ title: string; body: string }> = [];
  const lines = content.split("\n");
  let currentTitle = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    if (/^## /.test(line)) {
      if (currentTitle || currentLines.length > 0) {
        sections.push({ title: currentTitle, body: currentLines.join("\n") });
      }
      currentTitle = line;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  sections.push({ title: currentTitle, body: currentLines.join("\n") });
  return sections;
}

// Fix #3: relaxed requirement header regex; Fix #4: stop on `## ` headings
function parseRequirementBlocks(body: string): RequirementBlock[] {
  const blocks: RequirementBlock[] = [];
  const lines = body.split("\n");
  let currentName = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^###\s*Requirement:\s*(.+)\s*$/);
    if (match) {
      if (currentName) {
        blocks.push({ name: currentName, raw: currentLines.join("\n") });
      }
      currentName = match[1].trim();
      currentLines = [line];
    } else if (/^## /.test(line)) {
      if (currentName) {
        blocks.push({ name: currentName, raw: currentLines.join("\n") });
        currentName = "";
        currentLines = [];
      }
    } else if (currentName) {
      currentLines.push(line);
    }
  }
  if (currentName) {
    blocks.push({ name: currentName, raw: currentLines.join("\n") });
  }
  return blocks;
}

// Fix #2: normalize line endings at start
export function parseDeltaSpec(content: string): DeltaPlan {
  const normalized = normalizeLineEndings(content);
  const sections = splitSections(normalized);
  const plan: DeltaPlan = {
    added: [],
    modified: [],
    removed: [],
    renamed: [],
    sectionPresence: { added: false, modified: false, removed: false, renamed: false },
  };

  for (const section of sections) {
    const titleLower = section.title.toLowerCase();

    if (/added\s+requirements/.test(titleLower)) {
      plan.sectionPresence.added = true;
      plan.added = parseRequirementBlocks(section.body);
    } else if (/modified\s+requirements/.test(titleLower)) {
      plan.sectionPresence.modified = true;
      plan.modified = parseRequirementBlocks(section.body);
    } else if (/removed\s+requirements/.test(titleLower)) {
      plan.sectionPresence.removed = true;
      const lines = section.body.split("\n");
      for (const line of lines) {
        // Fix #5: support bullets and backticks
        const removedMatch = line.match(/^\s*-?\s*`?###\s*Requirement:\s*(.+?)`?\s*$/);
        if (removedMatch) {
          plan.removed.push(removedMatch[1].trim());
        }
      }
    } else if (/renamed\s+requirements/.test(titleLower)) {
      plan.sectionPresence.renamed = true;
      const lines = section.body.split("\n");
      let fromName: string | null = null;
      for (const line of lines) {
        // Fix #6: support bullets and backticks for FROM/TO
        const fromMatch = line.match(/^\s*-?\s*FROM:\s*`?###\s*Requirement:\s*(.+?)`?\s*$/i);
        const toMatch = line.match(/^\s*-?\s*TO:\s*`?###\s*Requirement:\s*(.+?)`?\s*$/i);
        if (fromMatch) {
          fromName = fromMatch[1].trim();
        } else if (toMatch && fromName) {
          plan.renamed.push({ from: fromName, to: toMatch[1].trim() });
          fromName = null;
        }
      }
    }
  }

  return plan;
}

// Fix #2: normalize line endings; Fix #7: case-insensitive; Fix #8: auto-create if missing
export function extractRequirementsSection(content: string): RequirementsSectionParts {
  const normalized = normalizeLineEndings(content);
  const lines = normalized.split("\n");
  let headerIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+Requirements\s*$/i.test(lines[i])) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    return {
      before: `${normalized.trimEnd()}\n\n`,
      headerLine: "## Requirements",
      preamble: "",
      bodyBlocks: [],
      after: "\n",
    };
  }

  const before = lines.slice(0, headerIndex).join("\n");
  const headerLine = lines[headerIndex];

  let endIndex = lines.length;
  for (let i = headerIndex + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) {
      endIndex = i;
      break;
    }
  }

  const after = lines.slice(endIndex).join("\n");
  const sectionBody = lines.slice(headerIndex + 1, endIndex);

  let firstReqIndex = -1;
  for (let i = 0; i < sectionBody.length; i++) {
    if (/^###\s*Requirement:/.test(sectionBody[i])) {
      firstReqIndex = i;
      break;
    }
  }

  let preamble: string;
  let reqLines: string[];
  if (firstReqIndex === -1) {
    preamble = sectionBody.join("\n");
    reqLines = [];
  } else {
    preamble = sectionBody.slice(0, firstReqIndex).join("\n");
    reqLines = sectionBody.slice(firstReqIndex);
  }

  const bodyBlocks = parseRequirementBlocks(reqLines.join("\n"));

  return { before, headerLine, preamble, bodyBlocks, after };
}
