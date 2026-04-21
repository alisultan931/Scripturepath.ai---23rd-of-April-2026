import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("studies")
    .select("id, title, scripture_ref, depth, study_data, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return Response.json({ error: "Study not found" }, { status: 404 });
  }

  return Response.json(data);
}
