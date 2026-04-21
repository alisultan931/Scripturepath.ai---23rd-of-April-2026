import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  await request.json().catch(() => null);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ ok: true });
}
