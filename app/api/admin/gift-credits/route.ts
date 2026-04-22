import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, credits } = await request.json();

  if (!email || typeof email !== "string") {
    return Response.json({ error: "email is required" }, { status: 400 });
  }
  if (!Number.isInteger(credits) || credits < 1 || credits > 10000) {
    return Response.json({ error: "credits must be an integer between 1 and 10000" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Find the user by email via the auth admin API
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    console.error("[admin/gift-credits] listUsers error:", listError);
    return Response.json({ error: "Failed to look up users" }, { status: 500 });
  }

  const target = users.find((u) => u.email === email.toLowerCase().trim());

  if (!target) {
    return Response.json({ error: `No account found for ${email}` }, { status: 404 });
  }

  const { data: profile, error: fetchError } = await admin
    .from("profiles")
    .select("credits")
    .eq("id", target.id)
    .single();

  if (fetchError || !profile) {
    return Response.json({ error: "User profile not found" }, { status: 404 });
  }

  const newBalance = (profile.credits ?? 0) + credits;

  const { error: updateError } = await admin
    .from("profiles")
    .update({ credits: newBalance })
    .eq("id", target.id);

  if (updateError) {
    console.error("[admin/gift-credits] update error:", updateError);
    return Response.json({ error: "Failed to update credits" }, { status: 500 });
  }

  return Response.json({
    success: true,
    email: target.email,
    credited: credits,
    newBalance,
  });
}
