import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // PKCE code exchange (used by password recovery and OAuth)
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectTo = next ?? "/chat";
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // OTP token hash (used by email confirmation)
  if (token_hash && type === "email") {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: "email", token_hash });

    if (!error) {
      return NextResponse.redirect(`${origin}/auth/confirmed`);
    }
  }

  // OTP token hash fallback for recovery
  if (token_hash && type === "recovery") {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash });

    if (!error) {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=invalid_confirmation_link`);
}
