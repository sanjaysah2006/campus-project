export const getMediaUrl = (path?: string | null): string | null => {
  if (!path) return null;

  // already full URL
  if (path.startsWith("http")) return path;

  // 🔥 IMPORTANT: use same base as API
  const base = import.meta.env.VITE_API_URL?.replace("/api/", "") || "";

  return `${base}${path}`;
};