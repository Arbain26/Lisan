/**
 * Returns the base URL of the backend server (no /api suffix).
 * Used for constructing image/file URLs.
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Given a path like "/uploads/foto.jpg", returns the full URL.
 * If the path is already a full URL (http/https), returns it unchanged.
 */
export function getMediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path}`;
}
