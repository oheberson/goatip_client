import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function GET(request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
    });
  } catch (error) {
    console.error("Error fetching session status:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
