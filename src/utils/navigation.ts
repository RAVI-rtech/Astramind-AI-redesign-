export const GITHUB_PAGES_BASE = "/Astramind-Ai";

/**
 * Returns the configured Vite base URL (defaults to '/Astramind-Ai/').
 */
export function getBaseUrl(): string {
  const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;
  const envBase = metaEnv?.BASE_URL ? String(metaEnv.BASE_URL) : `${GITHUB_PAGES_BASE}/`;
  return envBase.endsWith("/") ? envBase : `${envBase}/`;
}

/**
 * Resolves a public asset path (e.g. '/logo.png' or 'logo.png') so it works
 * under the '/Astramind-Ai/' subfolder on GitHub Pages as well as root deployments.
 */
export function getAssetUrl(assetPath: string): string {
  if (!assetPath) return "";
  if (/^(https?:|data:|blob:)/i.test(assetPath)) {
    return assetPath;
  }
  const cleanAsset = assetPath.replace(/^\/+/, "");
  const base = getBaseUrl();
  const baseNoLeading = base.replace(/^\/+/, "");
  if (baseNoLeading && cleanAsset.toLowerCase().startsWith(baseNoLeading.toLowerCase())) {
    return `/${cleanAsset}`;
  }
  return `${base}${cleanAsset}`;
}

/**
 * Converts a browser pathname (e.g. '/Astramind-Ai/coding', '/Astramind-Ai/', '/Astramind-Ai/index.html')
 * into a clean internal route path (e.g. '/coding', '/').
 */
export function normalizeInternalPath(rawPath?: string): string {
  const input = rawPath ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  if (!input) return "/";

  let path = input.trim();

  // Check if GitHub Pages 404 redirect passed a route via ?p= query parameter
  if (typeof window !== "undefined" && (!rawPath || rawPath === window.location.pathname)) {
    try {
      const params = new URLSearchParams(window.location.search);
      const redirectedRoute = params.get("p");
      if (redirectedRoute) {
        path = redirectedRoute;
      }
    } catch {
      // Ignore URLSearchParams errors
    }
  }

  // Strip query string or hash if passed directly
  const qIndex = path.indexOf("?");
  if (qIndex !== -1) path = path.slice(0, qIndex);
  const hIndex = path.indexOf("#");
  if (hIndex !== -1) path = path.slice(0, hIndex);

  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  // Strip configured base URL prefix (e.g. '/Astramind-Ai') case-insensitively
  const prefixes = [
    getBaseUrl().replace(/\/+$/, ""),
    GITHUB_PAGES_BASE,
  ].filter((p) => p && p !== "/");

  for (const prefix of prefixes) {
    const lowerPath = path.toLowerCase();
    const lowerPrefix = prefix.toLowerCase();
    if (lowerPath === lowerPrefix) {
      path = "/";
      break;
    } else if (lowerPath.startsWith(lowerPrefix + "/")) {
      path = path.slice(prefix.length) || "/";
      break;
    }
  }

  // Strip trailing /index.html
  if (path.toLowerCase().endsWith("/index.html")) {
    path = path.slice(0, -"/index.html".length) || "/";
  }

  // Collapse multiple slashes and remove trailing slash (except root '/')
  path = path.replace(/\/+/g, "/");
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path || "/";
}

/**
 * Converts an internal app route (e.g. '/', '/coding', '/login') into a browser URL
 * that preserves the '/Astramind-Ai/' subfolder base path.
 */
export function toBrowserUrl(internalPath: string): string {
  const normalized = normalizeInternalPath(internalPath);
  const basePrefix = getBaseUrl().replace(/\/+$/, "");

  if (!basePrefix || basePrefix === "") {
    return normalized;
  }

  if (normalized === "/") {
    return `${basePrefix}/`;
  }

  return `${basePrefix}${normalized}`;
}

/**
 * Returns the full OAuth redirect URL including the '/Astramind-Ai/' base path.
 */
export function getAppRedirectUrl(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${toBrowserUrl("/")}`;
}
