/**
 * Utility functions for image resolving and proxying.
 */

function extractUrl(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === 'string' && val.trim().length > 0) {
    return val.trim();
  }
  if (Array.isArray(val) && val.length > 0) {
    for (let i = val.length - 1; i >= 0; i--) {
      const url = extractUrl(val[i]);
      if (url) return url;
    }
  }
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    const url = obj.url || obj.src || obj.link;
    if (typeof url === 'string' && url.trim().length > 0) {
      return url.trim();
    }
    if (obj.contents) {
      const url = extractUrl(obj.contents);
      if (url) return url;
    }
    if (obj.thumbnail) {
      const url = extractUrl(obj.thumbnail);
      if (url) return url;
    }
  }
  return null;
}

export function resolveThumbnailUrl(item: unknown, size?: number): string | null {
  if (!item || typeof item !== 'object') return null;
  const obj = item as Record<string, unknown>;
  const info = obj.info as Record<string, unknown> | undefined;
  const header = obj.header as Record<string, unknown> | undefined;
  const v2 = info?.v2 as Record<string, unknown> | undefined;
  const v1 = info?.v1 as Record<string, unknown> | undefined;
  const user = info?.user as Record<string, unknown> | undefined;

  let rawUrl: string | null =
    extractUrl(obj.thumbnails) ||
    extractUrl(obj.thumbnail) ||
    extractUrl(header?.thumbnail) ||
    extractUrl(obj.avatar) ||
    extractUrl(obj.avatarUrl) ||
    extractUrl(obj.avatar_url) ||
    extractUrl(header?.avatar) ||
    extractUrl((header?.foregroundThumbnail as Record<string, unknown> | undefined)?.thumbnails) ||
    extractUrl(v2?.thumbnails) ||
    extractUrl((v2?.artist as Record<string, unknown> | undefined)?.thumbnails) ||
    extractUrl(v2?.avatarUrl) ||
    extractUrl(v2?.avatar) ||
    extractUrl(v1?.thumbnails) ||
    extractUrl((v1?.header as Record<string, unknown> | undefined)?.thumbnail) ||
    extractUrl((v1?.header as Record<string, unknown> | undefined)?.avatar) ||
    extractUrl(v1?.avatar) ||
    extractUrl(user?.thumbnails) ||
    extractUrl(user?.avatarUrl) ||
    extractUrl(user?.avatar);

  if (!rawUrl) return null;

  if (rawUrl.startsWith('//')) {
    rawUrl = `https:${rawUrl}`;
  }

  if (rawUrl.startsWith('/api/proxy/image') || rawUrl.startsWith('blob:')) {
    return rawUrl;
  }

  return `/api/proxy/image?r=${encodeURIComponent(rawUrl)}${size ? `&s=${size}` : ''}`;
}
