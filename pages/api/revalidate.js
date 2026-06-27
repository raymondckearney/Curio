export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const secret = req.headers['x-webhook-secret']
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return res.status(401).json({ message: 'Invalid secret' })
  }

  try {
    await res.revalidate('/insights')
    await res.revalidate('/insights/[slug]')
    return res.status(200).json({ revalidated: true })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}
