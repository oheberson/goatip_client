import { NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";

export async function GET(request) {
  // Get geolocation from Vercel headers
  const geo = geolocation(request);

  // Get all headers for debugging
  const headers = Object.fromEntries(request.headers.entries());

  const debugInfo = {
    geolocation: {
      country: geo.country,
      region: geo.region,
      city: geo.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      timezone: geo.timezone,
    },
    rawHeaders: {
      "x-vercel-ip-country": headers["x-vercel-ip-country"],
      "x-vercel-ip-country-region": headers["x-vercel-ip-country-region"],
      "x-vercel-ip-city": headers["x-vercel-ip-city"],
      "x-forwarded-for": headers["x-forwarded-for"],
      "x-real-ip": headers["x-real-ip"],
      "user-agent": headers["user-agent"],
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
  };

  return NextResponse.json(debugInfo);
}
