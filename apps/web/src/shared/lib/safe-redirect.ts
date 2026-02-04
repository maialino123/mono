const DEFAULT_REDIRECT = "/";

export function safeRedirect(to: string | null | undefined, defaultRedirect = DEFAULT_REDIRECT): string {
  if (!to || typeof to !== "string") return defaultRedirect;
  if (!to.startsWith("/") || to.startsWith("//")) return defaultRedirect;
  return to;
}
