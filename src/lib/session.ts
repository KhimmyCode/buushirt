import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'buushirt_super_secure_fallback_key_2026';

/**
 * Sign a payload with HMAC SHA256 and return a base64 encoded token: data.signature
 */
export function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('base64url'); // base64url is URL-safe and doesn't contain '=' or '/'
  return `${data}.${signature}`;
}

export interface SessionPayload {
  email?: string;
  admin?: boolean;
  role?: string;
}

/**
 * Verify HMAC signature and return the decoded payload or null
 */
export function verifyToken(token: string): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [data, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('base64url');

  // Time-safe comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}
