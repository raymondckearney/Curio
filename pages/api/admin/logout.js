import { clearCookie } from '../../../lib/adminSession';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', clearCookie());
  return res.status(200).json({ ok: true });
}
