import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabaseClient = () => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export async function POST(request) {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      console.log("Supabase not configured — treating as no free trial.");
      return NextResponse.json({
        isFreeTrial: false,
        error: "Supabase not configured",
      });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        isFreeTrial: false,
        error: "Email é necessário",
      });
    }

    // Check if user has an active free trial
    const { data: trialUser, error } = await supabase
      .from("free_trial_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Erro iniciando teste grátis:", error);
      return NextResponse.json({
        isFreeTrial: false,
        error: "Database error",
      });
    }

    if (trialUser) {
      return NextResponse.json({
        isFreeTrial: true,
        expiresAt: trialUser.expires_at,
        daysRemaining: Math.ceil(
          (new Date(trialUser.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
        ),
      });
    }

    return NextResponse.json({
      isFreeTrial: false,
    });
  } catch (error) {
    console.error("Erro ao checar teste grátis:", error);
    return NextResponse.json(
      {
        isFreeTrial: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
