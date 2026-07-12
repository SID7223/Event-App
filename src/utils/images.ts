export const MEDIA_BASE_URL = 'https://media.corlify.com';

export const UPLOAD_API_URL = 'https://upload-api.roadrunnerllc-bpo.workers.dev';

const VARIANT_DEFAULTS = {
  thumbnail: { w: 150, h: 150 },
  small: { w: 400, h: 300 },
  medium: { w: 800, h: 600 },
  large: { w: 1200, h: 900 },
} as const;

export type ImageVariant = keyof typeof VARIANT_DEFAULTS | string;

export function getImageUrl(imageId?: string | null, variant: ImageVariant = 'medium'): string {
  if (!imageId) return '';
  return `${MEDIA_BASE_URL}/images/${imageId}?variant=${variant}`;
}

export function getImageUrlCustom(imageId: string, width: number, height: number): string {
  return `${MEDIA_BASE_URL}/images/${imageId}?w=${width}&h=${height}`;
}

export function resolveImage(
  imageId?: string | null,
  fallbackUrl?: string | null,
  variant: ImageVariant = 'medium'
): string {
  if (imageId) return getImageUrl(imageId, variant);
  if (fallbackUrl) return fallbackUrl;
  return '';
}
