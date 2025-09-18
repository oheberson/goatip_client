import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const PRICE_CODES = [
  process.env.US_PRICE_CODE,
  process.env.BR_PRICE_CODE,
  process.env.EU_PRICE_CODE,
].filter(Boolean);

export async function POST(request) {
  try {
    if (!stripe) {
      console.log("Stripe not configured — treating as unsubscribed.");
      return NextResponse.json({ isSubscribed: false });
    }

    const { email } = await request.json();

    if (!email) {
      console.log("No email in request — treating as unsubscribed.");
      return NextResponse.json({ isSubscribed: false });
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (!customers.data.length) {
      return NextResponse.json({ isSubscribed: false });
    }

    const customer = customers.data[0];

    // Get all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 100,
    });

    for (const subscription of subscriptions.data) {
      for (const item of subscription.items.data) {
        if (PRICE_CODES.includes(item.price.id)) {
          return NextResponse.json({
            isSubscribed: true,
            subscriptionId: subscription.id,
            priceId: item.price.id,
            status: subscription.status,
          });
        }
      }
    }

    return NextResponse.json({ isSubscribed: false });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
