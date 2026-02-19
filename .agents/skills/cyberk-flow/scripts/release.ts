import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
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

/**
 * Extract the content between `## [Unreleased]` and the next `## [` section.
 * Returns the trimmed body text (without the header itself).
 */
export function extractUnreleasedContent(changelogContent: string): string {
  const unreleasedHeader = "## [Unreleased]";
  const idx = changelogContent.indexOf(unreleasedHeader);
  if (idx === -1) {
    throw new Error("No '## [Unreleased]' section found in CHANGELOG.md");
  }

  const afterHeader = idx + unreleasedHeader.length;
  const nextSectionMatch = changelogContent.slice(afterHeader).match(/\n## \[/);
  const endPos = nextSectionMatch
    ? // biome-ignore lint/style/noNonNullAssertion: index is guaranteed defined when match is truthy
      afterHeader + nextSectionMatch.index!
    : changelogContent.length;

  return changelogContent.slice(afterHeader, endPos).trim();
}

/**
 * Freeze the `[Unreleased]` section into a versioned entry.
 * Moves all content under `[Unreleased]` into `## [version] - date` and clears `[Unreleased]`.
 */
export function freezeChangelog(changelogContent: string, newVersion: string, date: string): string {
  const unreleasedContent = extractUnreleasedContent(changelogContent);
  if (!unreleasedContent) {
    throw new Error("Nothing to release — [Unreleased] section is empty");
  }

  const unreleasedHeader = "## [Unreleased]";
  const idx = changelogContent.indexOf(unreleasedHeader);
  const afterHeader = idx + unreleasedHeader.length;
  const nextSectionMatch = changelogContent.slice(afterHeader).match(/\n## \[/);
  // biome-ignore lint/style/noNonNullAssertion: index is guaranteed defined when match is truthy
  const endPos = nextSectionMatch ? afterHeader + nextSectionMatch.index! : changelogContent.length;

  const versionEntry = `## [${newVersion}] - ${date}\n\n${unreleasedContent}\n`;

  return (
    changelogContent.slice(0, idx) +
    unreleasedHeader +
    "\n\n" +
    versionEntry +
    "\n" +
    changelogContent.slice(endPos).trimStart()
  );
}

/**
 * Append a change entry under the `[Unreleased]` section.
 */
export function addUnreleasedEntry(changelogContent: string, changeId: string, summary: string): string {
  const unreleasedHeader = "## [Unreleased]";
  const idx = changelogContent.indexOf(unreleasedHeader);
  if (idx === -1) {
    throw new Error("No '## [Unreleased]' section found in CHANGELOG.md");
  }

  const afterHeader = idx + unreleasedHeader.length;
  const nextSectionMatch = changelogContent.slice(afterHeader).match(/\n## \[/);
  // biome-ignore lint/style/noNonNullAssertion: index is guaranteed defined when match is truthy
  const endPos = nextSectionMatch ? afterHeader + nextSectionMatch.index! : changelogContent.length;

  const existingContent = changelogContent.slice(afterHeader, endPos).trim();
  const newEntry = `- ${changeId}: ${summary}`;

  let newUnreleasedBody: string;
  if (existingContent.includes("### Changed")) {
    newUnreleasedBody = existingContent.replace(/(### Changed\n)/, `$1\n${newEntry}\n`);
  } else if (existingContent) {
    newUnreleasedBody = `${existingContent}\n${newEntry}`;
  } else {
    newUnreleasedBody = `### Changed\n\n${newEntry}`;
  }

  return (
    changelogContent.slice(0, idx) +
    unreleasedHeader +
    "\n\n" +
    newUnreleasedBody +
    "\n\n" +
    changelogContent.slice(endPos).trimStart()
  );
}

function main() {
  const bumpType = process.argv[2] as BumpType;

  if (!bumpType) {
    console.error("Usage: bun run cf release <major|minor|patch>");
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

  const changelogContent = readFileSync(changelogPath, "utf-8");
  const unreleasedContent = extractUnreleasedContent(changelogContent);
  if (!unreleasedContent) {
    console.error("Error: Nothing to release — [Unreleased] section is empty");
    process.exit(1);
  }

  const skillContent = readFileSync(skillMdPath, "utf-8");
  const currentVersion = readSkillVersion(skillContent);
  const newVersion = bumpVersion(currentVersion, bumpType);

  const updatedSkill = updateSkillVersion(skillContent, newVersion);
  writeFileSync(skillMdPath, updatedSkill);

  const now = new Date();
  const date = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;

  const updatedChangelog = freezeChangelog(changelogContent, newVersion, date);
  writeFileSync(changelogPath, updatedChangelog);

  console.log(`Released ${currentVersion} → ${newVersion}`);
  console.log(`Updated: ${skillMdPath}, ${changelogPath}`);
}

if (import.meta.main) {
  main();
}
