"use client";

import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function EmbeddedCheckoutWrapper() {
  const { user } = useAuth();

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user ? user.email : null,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ API error response:", errorText);
      throw new Error("Failed to create checkout session");
    }

    const data = await res.json();

    return data.clientSecret;
  }, [user]);

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
