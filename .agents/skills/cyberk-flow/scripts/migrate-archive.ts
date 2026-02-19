import { existsSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

// Old format with time: yyyy-MM-dd-HHmm-<name>
const OLD_WITH_TIME = /^(\d{4})-(\d{2})-(\d{2})-(\d{4})-(.+)$/;
// Old format without time: yyyy-MM-dd-<name>
const OLD_WITHOUT_TIME = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;
// New format: yyMMdd-HHmm-<name>
const NEW_FORMAT = /^\d{6}-\d{4}-.+$/;

export function convertArchiveName(dirName: string): { newName: string; status: "renamed" | "skipped" | "unknown" } {
  if (NEW_FORMAT.test(dirName)) {
    return { newName: dirName, status: "skipped" };
  }

  const withTime = dirName.match(OLD_WITH_TIME);
  if (withTime) {
    const [, yyyy, mm, dd, hhmm, name] = withTime;
    const yy = yyyy.slice(-2);
    return { newName: `${yy}${mm}${dd}-${hhmm}-${name}`, status: "renamed" };
  }

  const withoutTime = dirName.match(OLD_WITHOUT_TIME);
  if (withoutTime) {
    const [, yyyy, mm, dd, name] = withoutTime;
    const yy = yyyy.slice(-2);
    return { newName: `${yy}${mm}${dd}-0000-${name}`, status: "renamed" };
  }

  return { newName: dirName, status: "unknown" };
}

export function migrateArchive(archiveRoot: string): { renamed: string[]; skipped: string[]; warnings: string[] } {
  const renamed: string[] = [];
  const skipped: string[] = [];
  const warnings: string[] = [];

  if (!existsSync(archiveRoot)) {
    return { renamed, skipped, warnings };
  }

  const entries = readdirSync(archiveRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  for (const dirName of entries) {
    const { newName, status } = convertArchiveName(dirName);

    if (status === "skipped") {
      skipped.push(dirName);
      continue;
    }

    if (status === "unknown") {
      warnings.push(`Skipping unknown format: ${dirName}`);
      continue;
    }

    const target = join(archiveRoot, newName);
    if (existsSync(target)) {
      warnings.push(`Target already exists, skipping: ${dirName} → ${newName}`);
      continue;
    }

    renameSync(join(archiveRoot, dirName), target);
    renamed.push(`${dirName} → ${newName}`);
  }

  return { renamed, skipped, warnings };
}

if (import.meta.main) {
  const archiveRoot = join("cyberk-flow", "changes", "archive");
  const { renamed, skipped, warnings } = migrateArchive(archiveRoot);

  for (const w of warnings) {
    console.warn(`WARN: ${w}`);
  }
  for (const r of renamed) {
    console.log(`Renamed: ${r}`);
  }

  console.log(`\nMigration complete: ${renamed.length} renamed, ${skipped.length} skipped.`);
}
