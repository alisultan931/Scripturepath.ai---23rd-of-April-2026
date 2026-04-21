import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // Satisfy Next.js — body unused but must be consumed to avoid warnings
  await request.json().catch(() => null);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: deductResult, error: deductError } = await admin.rpc(
    "deduct_credits",
    { user_uuid: user.id, amount: 2 }
  );

  if (deductError) {
    console.error("[export-pdf] credit deduction error:", deductError);
    return Response.json({ error: "Failed to process credits" }, { status: 500 });
  }

  if (deductResult === -1) {
    return Response.json({ error: "Insufficient credits" }, { status: 402 });
  }

  return Response.json({ ok: true });
}
