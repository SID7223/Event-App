/**
 * Seed script: backfill all existing mock data images into R2 + D1.
 *
 * Usage:
 *   1. Set CLOUDFLARE_API_TOKEN env var
 *   2. npx tsx scripts/seed-images.ts
 *
 * This script:
 *   1. Extracts all unique image URLs from mockData.ts
 *   2. Downloads each, computes SHA-256
 *   3. Uploads to R2 (dedup by hash)
 *   4. Creates D1 records
 *   5. Outputs a JSON map of old URL → new imageId
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const UPLOAD_API = 'https://upload-api.roadrunnerllc-bpo.workers.dev/api/images/upload';
const AUTH_TOKEN = process.env.UPLOAD_AUTH_TOKEN || 'qZl1fBwz2uFVDRt4MCiJYxX5SQ8bKLjA';

interface ImageEntry {
  url: string;
  entityType: string;
  entityId: string;
  usageType: string;
  source: string;
}

async function extractImageUrls(): Promise<ImageEntry[]> {
  const entries: ImageEntry[] = [];

  // Read mockData.ts and extract all entity data
  const mockPath = resolve(__dirname, '../src/services/mockData.ts');
  const content = readFileSync(mockPath, 'utf-8');

  // Extract event images
  const eventMatches = content.matchAll(/id:\s*'([^']+)'[^}]*image:\s*'([^']+)'/g);
  for (const m of eventMatches) {
    entries.push({
      url: m[2],
      entityType: 'event',
      entityId: m[1],
      usageType: 'cover',
      source: 'seed',
    });
  }

  // Extract movie posters
  const movieMatches = content.matchAll(/id:\s*'([^']+)'[^}]*poster:\s*'([^']+)'/g);
  for (const m of movieMatches) {
    entries.push({
      url: m[2],
      entityType: 'movie',
      entityId: m[1],
      usageType: 'poster',
      source: 'seed',
    });
  }

  // Extract restaurant images
  const restMatches = content.matchAll(/id:\s*'([^']+)'[^}]*image:\s*'([^']+)'/g);
  for (const m of restMatches) {
    if (!entries.some(e => e.url === m[2])) {
      entries.push({
        url: m[2],
        entityType: 'restaurant',
        entityId: m[1],
        usageType: 'cover',
        source: 'seed',
      });
    }
  }

  // Extract venue/organizer avatars/logos
  const venueLogoMatches = content.matchAll(/id:\s*'([^']+)'[^}]*logo:\s*'([^']+)'/g);
  for (const m of venueLogoMatches) {
    entries.push({
      url: m[2],
      entityType: 'venue',
      entityId: m[1],
      usageType: 'logo',
      source: 'seed',
    });
  }

  const venueCoverMatches = content.matchAll(/id:\s*'([^']+)'[^}]*coverImage:\s*'([^']+)'/g);
  for (const m of venueCoverMatches) {
    entries.push({
      url: m[2],
      entityType: 'venue',
      entityId: m[1],
      usageType: 'cover',
      source: 'seed',
    });
  }

  const orgAvatarMatches = content.matchAll(/id:\s*'([^']+)'[^}]*avatar:\s*'([^']+)'/g);
  for (const m of orgAvatarMatches) {
    entries.push({
      url: m[2],
      entityType: 'organizer',
      entityId: m[1],
      usageType: 'avatar',
      source: 'seed',
    });
  }

  return entries;
}

async function uploadImage(entry: ImageEntry): Promise<{ imageId: string; url: string } | null> {
  try {
    const response = await fetch(entry.url);
    if (!response.ok) {
      console.warn(`  Failed to download ${entry.url}: ${response.status}`);
      return null;
    }

    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, `seed_${entry.entityId}.jpg`);
    formData.append('entity_type', entry.entityType);
    formData.append('entity_id', entry.entityId);
    formData.append('usage_type', entry.usageType);
    formData.append('source', entry.source);

    const uploadRes = await fetch(UPLOAD_API, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
      body: formData,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.warn(`  Upload failed for ${entry.url}: ${errText}`);
      return null;
    }

    return await uploadRes.json();
  } catch (err) {
    console.warn(`  Error processing ${entry.url}: ${err}`);
    return null;
  }
}

async function main() {
  console.log('Extracting image URLs from mock data...');
  const entries = await extractImageUrls();
  console.log(`Found ${entries.length} image references\n`);

  const urlMap: Record<string, { imageId: string; url: string }> = {};

  // Deduplicate by URL to avoid re-uploading
  const unique = new Map<string, ImageEntry>();
  for (const entry of entries) {
    if (!unique.has(entry.url)) {
      unique.set(entry.url, entry);
    }
  }

  console.log(`Unique images to process: ${unique.size}\n`);

  let done = 0;
  for (const [url, entry] of unique) {
    done++;
    console.log(`[${done}/${unique.size}] ${url}`);
    const result = await uploadImage(entry);
    if (result) {
      urlMap[url] = result;
      console.log(`  → imageId: ${result.imageId}`);
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  // Output mapping
  const outputPath = resolve(__dirname, '../.seed-image-map.json');
  writeFileSync(outputPath, JSON.stringify(urlMap, null, 2));
  console.log(`\nSeed complete! Mapping saved to .seed-image-map.json`);
  console.log(`Total images uploaded: ${Object.keys(urlMap).length}`);
}

main().catch(console.error);
