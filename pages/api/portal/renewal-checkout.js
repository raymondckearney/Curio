import Stripe from 'stripe';
import { getPortalSession } from '../../../lib/portalSession';
import { dbGet } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = getPortalSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { accountId } = session;

  try {
    const [accountRows, userRows] = await Promise.all([
      dbGet('client_accounts', { id: accountId }),
      dbGet('client_users', { id: session.userId }),
    ]);
    const account = accountRows[0];
    const user = userRows[0];

    const tier = account?.tier || 'basic';
    const priceId = tier === 'premium'
      ? process.env.STRIPE_PRICE_ASSESSMENT_ANALYZER
      : process.env.STRIPE_PRICE_ASSESSMENT;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        purpose: 'renewal',
        account_id: accountId,
        buyer_name: user?.name || '',
        buyer_email: user?.email || '',
        tier,
      },
      customer_email: user?.email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://choosecurio.com'}/portal/dashboard?renewed=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://choosecurio.com'}/portal/dashboard`,
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[portal/renewal-checkout]', err);
    return res.status(500).json({ error: err.message });
  }
}
