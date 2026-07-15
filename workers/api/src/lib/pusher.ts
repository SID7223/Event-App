export interface PusherConfig {
  appId: string;
  key: string;
  secret: string;
  cluster: string;
}

export function getPusherConfig(env: Record<string, unknown>): PusherConfig | null {
  const appId = env.PUSHER_APP_ID as string;
  const key = env.PUSHER_KEY as string;
  const secret = env.PUSHER_SECRET as string;
  const cluster = env.PUSHER_CLUSTER as string;
  if (!appId || !key || !secret || !cluster) return null;
  return { appId, key, secret, cluster };
}

export function authorizeChannel(config: PusherConfig, socketId: string, channelName: string): string {
  const authData = `${socketId}:${channelName}`;
  const sig = hmacSha256(config.secret, authData);
  return `${config.key}:${sig}`;
}

export async function triggerEvent(
  config: PusherConfig,
  channel: string,
  event: string,
  data: unknown
): Promise<boolean> {
  try {
    const body = JSON.stringify({
      name: event,
      channel,
      data: JSON.stringify(data),
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const bodyHash = md5(body);
    const authParams = `auth_key=${config.key}&auth_timestamp=${timestamp}&auth_version=1.0&body_md5=${bodyHash}`;
    const signature = await hmacSha256(config.secret, `POST\n/apps/${config.appId}/events\n${authParams}`);

    const url = `https://api-${config.cluster}.pusher.com/apps/${config.appId}/events?${authParams}&auth_signature=${signature}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Pusher trigger failed:', res.status, text);
    }

    return res.ok;
  } catch (e) {
    console.error('Pusher trigger error:', e);
    return false;
  }
}

function md5Bytes(bytes: Uint8Array): string {
  const padded: number[] = [];
  for (let i = 0; i < bytes.length; i++) padded.push(bytes[i]!);
  const origLenBits = bytes.length * 8;
  padded.push(0x80);
  while ((padded.length * 8) % 512 !== 448) padded.push(0);
  padded.push(origLenBits & 0xff, (origLenBits >>> 8) & 0xff, (origLenBits >>> 16) & 0xff, (origLenBits >>> 24) & 0xff, 0, 0, 0, 0);

  const w: number[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    w.push((padded[i]!) | ((padded[i + 1]!) << 8) | ((padded[i + 2]!) << 16) | ((padded[i + 3]!) << 24));
  }

  const F = (x: number, y: number, z: number) => (x & y) | (~x & z);
  const G = (x: number, y: number, z: number) => (x & z) | (y & ~z);
  const H = (x: number, y: number, z: number) => x ^ y ^ z;
  const I = (x: number, y: number, z: number) => y ^ (x | ~z);
  const rot = (x: number, n: number) => ((x << n) | (x >>> (32 - n))) >>> 0;
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];

  const T: number[] = [];
  for (let i = 1; i <= 64; i++) T.push(Math.floor(Math.abs(Math.sin(i)) * 0x100000000) >>> 0);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  for (let offset = 0; offset < w.length; offset += 16) {
    const X = w.slice(offset, offset + 16);
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      const f = i < 16 ? F(B, C, D) : i < 32 ? G(B, C, D) : i < 48 ? H(B, C, D) : I(B, C, D);
      const g = i < 16 ? i : i < 32 ? (5 * i + 1) % 16 : i < 48 ? (3 * i + 5) % 16 : (7 * i) % 16;
      const temp = (A + f + T[i]! + (X[g]!)) >>> 0;
      const prevB = B, prevC = C;
      A = D;
      B = (B + rot(temp, S[i]!)) >>> 0;
      C = prevB;
      D = prevC;
    }
    a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
  }

  const hex = (w: number) => {
    const lo = w & 0xff, hi = (w >>> 8) & 0xff, hi2 = (w >>> 16) & 0xff, hi3 = (w >>> 24) & 0xff;
    return lo.toString(16).padStart(2,'0') + hi.toString(16).padStart(2,'0') + hi2.toString(16).padStart(2,'0') + hi3.toString(16).padStart(2,'0');
  };
  return hex(a0) + hex(b0) + hex(c0) + hex(d0);
}

function md5(input: string): string {
  return md5Bytes(new TextEncoder().encode(input));
}

async function hmacSha256(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}
