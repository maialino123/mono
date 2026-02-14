import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const BUMP_TYPES = ["major", "minor", "patch"] as const;
type BumpType = (typeof BUMP_TYPES)[number];

function getSkillMdPath(): string {
  return process.env.CF_SKILL_MD_PATH ?? join("skills", "cyberk-flow", "SKILL.md");
}

function getChangelogPath(): string {
  return process.env.CF_CHANGELOG_PATH ?? join("skills", "cyberk-flow", "CHANGELOG.md");
}

function parseVersion(version: string): [number, number, number] {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version: ${version}`);
  }
  return parts as [number, number, number];
}

function bumpVersion(version: string, type: BumpType): string {
  const [major, minor, patch] = parseVersion(version);
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}

function readSkillVersion(content: string): string {
  const match = content.match(/^version:\s*(.+)$/m);
  if (!match) {
    throw new Error("No 'version' field found in SKILL.md frontmatter");
  }
  return match[1].trim();
}

function updateSkillVersion(content: string, newVersion: string): string {
  return content.replace(/^(version:\s*).+$/m, `$1${newVersion}`);
}

function findChangeDir(changeId: string): string {
  const activeDir = join("cyberk-flow", "changes", changeId);
  if (existsSync(activeDir)) return activeDir;

  const archiveDir = join("cyberk-flow", "changes", "archive");
  if (existsSync(archiveDir)) {
    const entries = readdirSync(archiveDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.endsWith(`-${changeId}`))
      .sort((a, b) => b.name.localeCompare(a.name));
    if (entries.length > 0) return join(archiveDir, entries[0].name);
  }

  throw new Error(`Change '${changeId}' not found in active or archived changes`);
}

function extractWhySection(proposalContent: string): string {
  const lines = proposalContent.split("\n");
  const whyIdx = lines.findIndex((l) => /^##\s+Why/i.test(l));
  if (whyIdx === -1) return "No description available.";

  const contentLines: string[] = [];
  for (let i = whyIdx + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) break;
    contentLines.push(lines[i]);
  }
  const raw = contentLines.join(" ").replace(/\s+/g, " ").trim();
  return raw || "No description available.";
}

export function updateChangelog(
  changelogContent: string,
  newVersion: string,
  date: string,
  changeId: string,
  summary: string,
): string {
  const entry = `## [${newVersion}] - ${date}\n\n### Changed\n\n- ${changeId}: ${summary}\n`;
  const unreleasedHeader = "## [Unreleased]";
  const idx = changelogContent.indexOf(unreleasedHeader);
  if (idx === -1) {
    throw new Error("No '## [Unreleased]' section found in CHANGELOG.md");
  }

  const afterUnreleased = idx + unreleasedHeader.length;
  const nextSectionMatch = changelogContent.slice(afterUnreleased).match(/\n## \[/);
  const insertPos = nextSectionMatch ? afterUnreleased + nextSectionMatch.index! : changelogContent.length;

  return (
    changelogContent.slice(0, insertPos).trimEnd() +
    "\n\n" +
    entry +
    "\n" +
    changelogContent.slice(insertPos).trimStart()
  );
}

function main() {
  const changeId = process.argv[2];
  const bumpType = process.argv[3] as BumpType;

  if (!changeId || !bumpType) {
    console.error("Usage: bun run cf release <change-id> <major|minor|patch>");
    process.exit(1);
  }

  if (!BUMP_TYPES.includes(bumpType)) {
    console.error(`Error: Invalid bump type '${bumpType}'. Must be one of: ${BUMP_TYPES.join(", ")}`);
    process.exit(1);
  }

  const skillMdPath = getSkillMdPath();
  const changelogPath = getChangelogPath();

  if (!existsSync(skillMdPath)) {
    console.error(`Error: SKILL.md not found at ${skillMdPath}`);
    process.exit(1);
  }

  if (!existsSync(changelogPath)) {
    console.error(`Error: CHANGELOG.md not found at ${changelogPath}`);
    process.exit(1);
  }

  const changeDir = findChangeDir(changeId);
  const proposalPath = join(changeDir, "proposal.md");
  if (!existsSync(proposalPath)) {
    console.error(`Error: proposal.md not found at ${proposalPath}`);
    process.exit(1);
  }

  const proposalContent = readFileSync(proposalPath, "utf-8");
  const summary = extractWhySection(proposalContent);

  const skillContent = readFileSync(skillMdPath, "utf-8");
  const currentVersion = readSkillVersion(skillContent);
  const newVersion = bumpVersion(currentVersion, bumpType);

  const updatedSkill = updateSkillVersion(skillContent, newVersion);
  writeFileSync(skillMdPath, updatedSkill);

  const now = new Date();
  const date = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;

  const changelogContent = readFileSync(changelogPath, "utf-8");
  const updatedChangelog = updateChangelog(changelogContent, newVersion, date, changeId, summary);
  writeFileSync(changelogPath, updatedChangelog);

  console.log(`Released ${currentVersion} → ${newVersion}`);
  console.log(`Updated: ${skillMdPath}, ${changelogPath}`);
}

if (import.meta.main) {
  main();
}
