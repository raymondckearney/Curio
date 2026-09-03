import Stripe from 'stripe';
import { dbGet, dbQuery } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Look up the assessment token created by the webhook for this purchase
    let assessmentUrl = null;
    try {
      const purchases = await dbGet('purchases', { stripe_session_id: session_id }).catch(() => []);
      if (purchases.length) {
        const { engagement_id } = purchases[0];
        const tokens = await dbQuery('tokens', {
          engagement_id: `eq.${engagement_id}`,
          purpose: 'eq.assessment',
          used: 'eq.false',
        }).catch(() => []);
        if (tokens.length) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://choosecurio.com';
          assessmentUrl = `${baseUrl}/go/${tokens[0].token}`;
        }
      }
    } catch (lookupErr) {
      console.error('[stripe/session] token lookup failed:', lookupErr.message);
    }

    return res.status(200).json({
      customer_email: session.customer_email,
      customer_name: session.customer_details?.name,
      metadata: session.metadata,
      payment_status: session.payment_status,
      assessmentUrl,
    });
  } catch (err) {
    console.error('[stripe/session]', err);
    return res.status(500).json({ error: err.message });
  }
}
