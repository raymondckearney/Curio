import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return res.status(200).json({
      customer_email: session.customer_email,
      customer_name: session.customer_details?.name,
      metadata: session.metadata,
      payment_status: session.payment_status,
    });
  } catch (err) {
    console.error('[stripe/session]', err);
    return res.status(500).json({ error: err.message });
  }
}
