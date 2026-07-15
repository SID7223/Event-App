const SALT_LENGTH = 16;
const HASH_ALGORITHM = 'PBKDF2';
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: HASH_ALGORITHM }, false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: HASH_ALGORITHM, salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, KEY_LENGTH * 8);
  return hex(salt) + ':' + hex(hash);
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [saltHex, hashHex] = parts;
  const salt = fromHex(saltHex!);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: HASH_ALGORITHM }, false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: HASH_ALGORITHM, salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, KEY_LENGTH * 8);
  return hex(hash) === hashHex;
}

export function generateSecureToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return hex(bytes);
}
