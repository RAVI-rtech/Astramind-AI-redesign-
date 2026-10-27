/**
 * Navigation and URL helper utilities for AstraMind AI
 * Supports root deployment, subfolder deployments (e.g. GitHub Pages at /Astramind-Ai/),
 * and local/preview environments.
 */

export const SUBFOLDER_BASE = "/Astramind-Ai";

/**
 * Returns the active base prefix for browser URLs (e.g. "/Astramind-Ai" or "").
 */
export function getBasePrefix(): string {
  const metaBase = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  if (metaBase && metaBase !== "/") {
    return metaBase;
  }
  if (typeof window !== "undefined") {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith("/astramind-ai")) {
      return SUBFOLDER_BASE;
    }
  }
  return "";
}

/**
 * Normalizes an external browser path to an internal application route.
 * Example:
 *   "/Astramind-Ai/workspace" -> "/workspace"
 *   "/Astramind-Ai"           -> "/"
 *   "/Astramind-Ai/"          -> "/"
 *   "/coding"                 -> "/coding"
 */
export function normalizeInternalPath(path?: string): string {
  if (!path) return "/";
  let p = path.toLowerCase().trim();

  // Strip query/hash if present
  p = p.split("?")[0].split("#")[0];

  const metaBase = (import.meta.env.BASE_URL || "/").toLowerCase().replace(/\/$/, "");
  if (metaBase && metaBase !== "/" && p.startsWith(metaBase)) {
    p = p.slice(metaBase.length);
  }

  if (p.startsWith("/astramind-ai")) {
    p = p.slice("/astramind-ai".length);
  }

  // Remove trailing slash except for root "/"
  p = p.replace(/\/$/, "");
  return p || "/";
}

/**
 * Converts an internal route to a full browser URL preserving the deployment subfolder.
 * Example:
 *   "/workspace" -> "/Astramind-Ai/workspace" (on GitHub Pages)
 *   "/"          -> "/Astramind-Ai/" (on GitHub Pages)
 *   "/workspace" -> "/workspace" (in root dev)
 */
export function toBrowserUrl(path: string): string {
  const internal = normalizeInternalPath(path);
  const prefix = getBasePrefix();
  if (!prefix) return internal;
  return internal === "/" ? `${prefix}/` : `${prefix}${internal}`;
}

/**
 * Resolves static assets (like logo, icons) relative to the current BASE_URL.
 */
export function getAssetUrl(assetPath: string): string {
  const clean = assetPath.replace(/^\//, "");
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${clean}`;
}
