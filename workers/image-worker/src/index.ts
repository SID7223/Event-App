interface ImageRow {
  id: string;
  storage_key: string;
  content_type: string;
  width: number;
  height: number;
  blur_hash: string | null;
  status: string;
}

interface VariantConfig {
  width: number;
  height: number;
  fit: string;
  quality: number;
  format: string;
}

interface Env {
  chillingz_db: D1Database;
  chillingz_media: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts[0] !== 'images' || !pathParts[1]) {
      return new Response('Not found', { status: 404 });
    }

    const imageId = pathParts[1];
    const variant = url.searchParams.get('variant');
    const widthParam = url.searchParams.get('w');
    const heightParam = url.searchParams.get('h');

    try {
      const image = await env.chillingz_db.prepare(
        'SELECT id, storage_key, content_type, width, height, blur_hash, status FROM images WHERE id = ? AND status = ?'
      ).bind(imageId, 'active').first<ImageRow>();

      if (!image) {
        return new Response('Image not found', { status: 404 });
      }

      const object = await env.chillingz_media.get(image.storage_key);
      if (!object) {
        return new Response('Image not found', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('CDN-Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Vary', 'Accept, Accept-Encoding');
      headers.set('Access-Control-Allow-Origin', '*');

      if (image.blur_hash) {
        headers.set('X-Blur-Hash', image.blur_hash);
      }

      const wantsResize = variant || widthParam || heightParam;
      if (wantsResize) {
        let targetWidth: number | undefined;
        let targetHeight: number | undefined;
        let fit = 'cover';
        let quality = 85;
        let format = 'auto';

        if (variant) {
          const vc = await env.chillingz_db.prepare(
            'SELECT width, height, fit, quality, format FROM image_variants_config WHERE name = ?'
          ).bind(variant).first<VariantConfig>();
          if (vc) {
            targetWidth = vc.width;
            targetHeight = vc.height;
            fit = vc.fit;
            quality = vc.quality;
            format = vc.format;
          }
        }

        if (widthParam) targetWidth = parseInt(widthParam, 10);
        if (heightParam) targetHeight = parseInt(heightParam, 10);

        const blob = await object.arrayBuffer();

        return new Response(blob, {
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
            'CDN-Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Type': image.content_type,
            'Access-Control-Allow-Origin': '*',
          },
          cf: {
            image: {
              width: targetWidth,
              height: targetHeight,
              fit: fit,
              quality,
              format: format,
            },
          } as any,
        });
      }

      return new Response(object.body, { headers });
    } catch (err) {
      return new Response('Internal error', { status: 500 });
    }
  },
};
