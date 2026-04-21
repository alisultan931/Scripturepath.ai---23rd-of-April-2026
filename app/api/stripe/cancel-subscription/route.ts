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
    .select("stripe_subscription_id, subscription_status")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id) {
    return Response.json({ error: "No active subscription" }, { status: 400 });
  }

  // Trials are canceled immediately — no charge has been made
  if (profile.subscription_status === "trialing") {
    await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    // Webhook (customer.subscription.deleted) handles the DB update
    return Response.json({ success: true, immediate: true });
  }

  const subscription = await stripe.subscriptions.update(profile.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  const rawPeriodEnd = subscription.items?.data?.[0]?.current_period_end;
  const current_period_end = typeof rawPeriodEnd === "number"
    ? new Date(rawPeriodEnd * 1000).toISOString()
    : null;

  await admin
    .from("profiles")
    .update({ subscription_status: "canceling", ...(current_period_end ? { current_period_end } : {}) })
    .eq("id", user.id);

  return Response.json({ success: true, current_period_end });
}
