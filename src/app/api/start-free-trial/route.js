import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        error: "Email é necessário",
      });
    }

    // Check if user already has an active trial
    const { data: existingTrial, error: checkError } = await supabase
      .from("free_trial_users")
      .select("*")
      .eq("email", email)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Erro checando teste grátis existente:", checkError);
      return NextResponse.json({
        success: false,
        error: "Database error",
      });
    }

    // If trial exists and is still active, return existing trial info
    if (existingTrial) {
      return NextResponse.json({
        success: true,
        message: "Teste grátis já ativo",
        expiresAt: existingTrial.expires_at,
        daysRemaining: Math.ceil(
          (new Date(existingTrial.expires_at) - new Date()) /
            (1000 * 60 * 60 * 24)
        ),
      });
    }

    // Start new trial (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: newTrial, error: insertError } = await supabase
      .from("free_trial_users")
      .insert({
        email: email,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro ao iniciar teste grátis:", insertError);
      return NextResponse.json({
        success: false,
        error: "Falha ao iniciar teste grátis",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Teste grátis iniciado com sucesso!",
      expiresAt: newTrial.expires_at,
      daysRemaining: 7,
    });
  } catch (error) {
    console.error("Erro iniciando teste grátis:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
