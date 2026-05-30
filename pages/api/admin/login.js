import { createSessionToken, sessionCookie } from '../../../lib/adminSession';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  if (username === 'admin' && password === process.env.ADMIN_SECRET) {
    const token = createSessionToken();
    res.setHeader('Set-Cookie', sessionCookie(token));
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
}
