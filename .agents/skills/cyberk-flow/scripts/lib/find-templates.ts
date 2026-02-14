import { existsSync } from "fs";
import { join, resolve } from "path";

/**
 * Resolve the skill templates directory from known install locations.
 * Returns the absolute path to the templates dir, or empty string if not found.
 */
export function findSkillTemplatesDir(): string {
  const candidates = [
    join(".agents", "skills", "cyberk-flow", "templates"),
    join("skills", "cyberk-flow", "templates"),
  ];
  for (const dir of candidates) {
    if (existsSync(dir)) return dir;
  }
  // Fallback: resolve relative to this script's location
  const scriptDir = resolve(import.meta.dir, "..", "..", "templates");
  if (existsSync(scriptDir)) return scriptDir;
  return "";
}
