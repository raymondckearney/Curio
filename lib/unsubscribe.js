import crypto from 'crypto';

const SECRET = process.env.PORTAL_SECRET || process.env.ADMIN_SECRET;

// No-login-required unsubscribe links: signs a userId so the link itself
// proves the click is legitimate (same HMAC approach as portalSession.js's
// session cookie) without requiring the recipient to log in first — the
// whole point of a one-click unsubscribe.
export function signUnsubscribeToken(userId) {
  const sig = crypto.createHmac('sha256', SECRET).update(userId).digest('hex');
  return Buffer.from(`${userId}.${sig}`).toString('base64url');
}

export function verifyUnsubscribeToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const dot = decoded.lastIndexOf('.');
    const userId = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    const expected = crypto.createHmac('sha256', SECRET).update(userId).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return userId;
  } catch {
    return null;
  }
}

export function unsubscribeUrl(userId) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://choosecurio.com';
  return `${base}/api/unsubscribe?u=${signUnsubscribeToken(userId)}`;
}
