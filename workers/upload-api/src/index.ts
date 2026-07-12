interface Env {
  chillingz_db: D1Database;
  chillingz_media: R2Bucket;
  UPLOAD_AUTH_TOKEN: string;
}

function nanoid(size = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  for (let i = 0; i < size; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

async function sha256(data: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hex;
}

async function detectDimensions(data: ArrayBuffer, contentType: string): Promise<{ width: number; height: number } | null> {
  const bytes = new Uint8Array(data);
  if (contentType === 'image/jpeg' || contentType === 'image/jpg') {
    let offset = 0;
    while (offset < bytes.length - 1) {
      if (bytes[offset] === 0xFF && bytes[offset + 1] === 0xC0) {
        offset += 5;
        if (offset + 3 < bytes.length) {
          return {
            height: (bytes[offset] << 8) | bytes[offset + 1],
            width: (bytes[offset + 2] << 8) | bytes[offset + 3],
          };
        }
        break;
      }
      offset++;
    }
  }
  if (contentType === 'image/png') {
    if (bytes.length >= 24) {
      return {
        width: (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19],
        height: (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23],
      };
    }
  }
  if (contentType === 'image/webp') {
    if (bytes.length >= 30) {
      return {
        width: (bytes[26] << 8) | bytes[27],
        height: (bytes[28] << 8) | bytes[29],
      };
    }
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${env.UPLOAD_AUTH_TOKEN}`) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    try {
      const contentType = request.headers.get('Content-Type') || '';

      let file: ArrayBuffer;
      let filename: string;
      let fileContentType: string;
      let entityType: string;
      let entityId: string;
      let usageType: string;
      let source = 'user_upload';
      let attribution: string | undefined;
      let altText: string | undefined;

      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const fileField = formData.get('file') as File | null;
        if (!fileField) {
          return new Response('Missing file field', { status: 400, headers: corsHeaders });
        }
        file = await fileField.arrayBuffer();
        filename = fileField.name;
        fileContentType = fileField.type || 'image/jpeg';
        entityType = (formData.get('entity_type') as string) || '';
        entityId = (formData.get('entity_id') as string) || '';
        usageType = (formData.get('usage_type') as string) || '';
        source = (formData.get('source') as string) || 'user_upload';
        attribution = formData.get('attribution') as string || undefined;
        altText = formData.get('alt_text') as string || undefined;
      } else {
        const body: any = await request.json();
        file = body.file as unknown as ArrayBuffer;
        filename = body.filename || 'upload';
        fileContentType = body.contentType || 'image/jpeg';
        entityType = body.entityType;
        entityId = body.entityId;
        usageType = body.usageType;
        source = body.source || 'user_upload';
        attribution = body.attribution;
        altText = body.altText;
      }

      if (!entityType || !entityId || !usageType) {
        return new Response('Missing entity_type, entity_id, or usage_type', { status: 400, headers: corsHeaders });
      }

      const fileHash = await sha256(file);
      const ext = filename.split('.').pop() || 'jpg';
      const storageKey = `images/original/${fileHash}.${ext}`;

      const existing = await env.chillingz_db.prepare(
        'SELECT id FROM images WHERE original_hash = ?'
      ).bind(fileHash).first<{ id: string }>();

      if (existing) {
        const usageId = nanoid();
        await env.chillingz_db.prepare(
          'INSERT OR IGNORE INTO image_usages (id, image_id, entity_type, entity_id, usage_type, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))'
        ).bind(usageId, existing.id, entityType, entityId, usageType).run();

        return new Response(JSON.stringify({
          image_id: existing.id,
          deduplicated: true,
          url: `https://media.corlify.com/images/${existing.id}`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const imageId = `img_${nanoid(12)}`;
      const dims = await detectDimensions(file, fileContentType);

      await env.chillingz_media.put(storageKey, file, {
        httpMetadata: {
          contentType: fileContentType,
          cacheControl: 'public, max-age=31536000, immutable',
        },
      });

      await env.chillingz_db.prepare(
        `INSERT INTO images (id, storage_key, original_hash, original_filename, content_type, file_size, width, height, source, alt_text, attribution, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      ).bind(
        imageId, storageKey, fileHash, filename, fileContentType,
        file.byteLength, dims?.width || null, dims?.height || null,
        source, altText || null, attribution || null
      ).run();

      const usageId = nanoid();
      await env.chillingz_db.prepare(
        'INSERT INTO image_usages (id, image_id, entity_type, entity_id, usage_type, created_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))'
      ).bind(usageId, imageId, entityType, entityId, usageType).run();

      return new Response(JSON.stringify({
        image_id: imageId,
        deduplicated: false,
        url: `https://media.corlify.com/images/${imageId}`,
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Upload failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
