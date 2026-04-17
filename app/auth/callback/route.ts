import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type === "email") {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: "email", token_hash });

    if (!error) {
      return NextResponse.redirect(`${origin}/auth/confirmed`);
    }
  }

  if (token_hash && type === "recovery") {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash });

    if (!error) {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=invalid_confirmation_link`);
}
