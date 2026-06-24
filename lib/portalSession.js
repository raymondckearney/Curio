import crypto from 'crypto';

const SECRET = process.env.PORTAL_SECRET || process.env.ADMIN_SECRET;

function sign(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('hex');
}

export function createSessionToken(userId, accountId, role) {
  const data = `${userId}:${accountId}:${role}:${Date.now()}`;
  return Buffer.from(`${data}.${sign(data)}`).toString('base64url');
}

export function verifySessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const dot = decoded.lastIndexOf('.');
    const data = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(data)))) return null;
    const parts = data.split(':');
    if (parts.length < 4) return null;
    const ts = parseInt(parts[3], 10);
    if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return null;
    return { userId: parts[0], accountId: parts[1], role: parts[2] };
  } catch {
    return null;
  }
}

export function getPortalSession(req) {
  const raw = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    raw.split(';').filter(Boolean).map(c => {
      const i = c.indexOf('=');
      return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())];
    })
  );
  const token = cookies['curio_portal'];
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookie(token) {
  return `curio_portal=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
}

export function clearCookie() {
  return 'curio_portal=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
}
