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
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'], 
      metadata: {
        medicineId: medicineId,
        quantity: quantity.toString()
      },

      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: name,
            },
            unit_amount: Math.round(unitAmount * 100), // in cents
          },
          quantity: quantity,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    // We return the URL so the client-side can perform the redirect
    return { url: session.url };
  } catch (error) {
    console.error('Stripe Session Error:', error);
    return { error: 'Failed to create checkout session' };
  }
}