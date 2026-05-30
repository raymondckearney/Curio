import crypto from 'crypto';

function sign(data) {
  return crypto.createHmac('sha256', process.env.ADMIN_SECRET).update(data).digest('hex');
}

export function createSessionToken() {
  const data = `admin:${Date.now()}`;
  const sig = sign(data);
  return Buffer.from(`${data}.${sig}`).toString('base64url');
}

export function verifySessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const dot = decoded.lastIndexOf('.');
    const data = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(data)))) return false;
    const ts = parseInt(data.split(':')[1], 10);
    return Date.now() - ts < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function getAdminSession(req) {
  const raw = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    raw.split(';').filter(Boolean).map(c => {
      const i = c.indexOf('=');
      return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())];
    })
  );
  const token = cookies['curio_admin'];
  return token && verifySessionToken(token) ? { admin: true } : null;
}

export function sessionCookie(token) {
  return `curio_admin=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24}`;
}

export function clearCookie() {
  return 'curio_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';
}
