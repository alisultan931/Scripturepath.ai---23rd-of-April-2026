import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return Response.json({ error: "No subscription found" }, { status: 400 });
  }

  await stripe.subscriptions.update(profile.stripe_subscription_id, {
    cancel_at_period_end: false,
  });

  await admin
    .from("profiles")
    .update({ subscription_status: "active" })
    .eq("id", user.id);

  return Response.json({ success: true });
}
