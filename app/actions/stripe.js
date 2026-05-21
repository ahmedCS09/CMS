"use server";
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(data) {
  // Extracting data from the payload
  const medicineId = typeof data.get === 'function' ? data.get('medicineId') : data.medicineId;
  const name = typeof data.get === 'function' ? data.get('name') : data.name;
  const unitAmount = typeof data.get === 'function' ? data.get('price') : data.price;
  const quantity = parseInt((typeof data.get === 'function' ? data.get('quantity') : data.quantity) || '1');
  const email = typeof data.get === 'function' ? data.get('email') : data.email;

  // Get the base URL (e.g., http://localhost:3000) to create success/cancel links
  const headersList = await headers();
  const origin = headersList.get('origin');

  try {
    const sessionConfig = {
      mode: 'payment',
      payment_method_types: ['card'],
      metadata: {
        medicineId: medicineId,
        quantity: quantity.toString(),
        email: email || ''
      },

      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: name,
            },
            unit_amount: Math.round(parseFloat(unitAmount) * 100), // convert to cents (paisa)
          },
          quantity: quantity,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    };

    if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // We return the URL so the client-side can perform the redirect
    return { url: session.url };
  } catch (error) {
    console.error('Stripe Session Error:', error);
    return { error: error.message || 'Failed to create checkout session' };
  }
}