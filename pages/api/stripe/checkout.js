import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, priceId, product } = req.body || {};
  if (!name || !email || !priceId || !product) {
    return res.status(400).json({ error: 'name, email, priceId, and product are required' });
  }

  if (priceId.startsWith('prod_')) {
    return res.status(500).json({ error: 'Configuration error: STRIPE_PRICE env vars must be price IDs (price_xxx), not product IDs (prod_xxx). Update in Vercel environment variables.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://choosecurio.com/buy/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://choosecurio.com/buy/cancel',
      metadata: { buyer_name: name, buyer_email: email, product },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return res.status(500).json({ error: err.message });
  }
}
