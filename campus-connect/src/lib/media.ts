export const getMediaUrl = (path?: string | null): string | null => {
  if (!path) return null;

  // already full URL
  if (path.startsWith("http")) return path;

  // remove trailing /api or /api/
  const base = import.meta.env.VITE_API_URL
    ?.replace(/\/api\/?$/, "") || "";

  return `${base}${path}`;
};