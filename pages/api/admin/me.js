import { getAdminSession } from '../../../lib/adminSession';

export default function handler(req, res) {
  const session = getAdminSession(req);
  if (session) return res.status(200).json({ ok: true });
  return res.status(401).json({ ok: false });
}
