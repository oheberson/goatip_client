import { NextResponse } from "next/server";
import Stripe from "stripe";
import { geolocation } from "@vercel/functions";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// List of EU country codes (ISO 3166-1 alpha-2)
const EU_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];

function getRegionFromCountry(countryCode) {
  if (!countryCode) return "US";
  if (countryCode === "US") return "US";
  if (countryCode === "BR") return "BR";
  if (EU_COUNTRIES.includes(countryCode)) return "EU";
  return "US";
}

function getPriceCodeForRegion(region) {
  switch (region) {
    case "US":
      return process.env.US_PRICE_CODE;
    case "BR":
      return process.env.BR_PRICE_CODE;
    case "EU":
      return process.env.EU_PRICE_CODE;
    default:
      return process.env.US_PRICE_CODE;
  }
}

async function findOrCreateCustomer(email) {
  try {
    // Try to find existing customer
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data && customers.data.length > 0) {
      return customers.data[0];
    }
  } catch (error) {
    console.log("Error finding customer, will create new one:", error.message);
  }

  // Create new customer
  const customer = await stripe.customers.create({ email });

  return customer;
}

async function createCheckoutSession(customerId, priceCode) {
  const sessionData = {
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: priceCode,
        quantity: 1,
      },
    ],
    ui_mode: "embedded",
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
  };

  if (customerId) {
    sessionData.customer = customerId;
  }

  return stripe.checkout.sessions.create(sessionData);
}

export async function POST(request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const { email } = await request.json();

    // Get geolocation from Vercel headers
    const geo = geolocation(request);

    const countryCode = geo.country;

    const region = getRegionFromCountry(countryCode);

    const priceCode = getPriceCodeForRegion(region);

    let session;

    if (email) {
      // Look up or create persistent customer
      const customer = await findOrCreateCustomer(email);
      session = await createCheckoutSession(customer.id, priceCode);
    } else {
      console.log("No email provided");
      session = await createCheckoutSession(null, priceCode);
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Stripe session creation failed", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
