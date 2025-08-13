const base = (import.meta.env.VITE_API_URL || "").trim();

// If VITE_API_URL exists → use backend API.
// Otherwise → keep using /memory directly (current local behavior).
export function memoryUrl(relPath) {
  const p = relPath.startsWith("/") ? relPath : `/${relPath}`;
  return base ? `${base}/api/memory${p}` : `/memory${p}`;
}
