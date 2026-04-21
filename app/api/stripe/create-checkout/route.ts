import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await request.json() as { plan: "monthly" | "yearly" | "trial-monthly" | "trial-yearly" };

  const isTrial = plan === "trial-monthly" || plan === "trial-yearly";
  const billingPlan: "monthly" | "yearly" = isTrial
    ? plan === "trial-yearly" ? "yearly" : "monthly"
    : plan as "monthly" | "yearly";

  const priceId =
    billingPlan === "yearly"
      ? process.env.STRIPE_PRICE_YEARLY!
      : process.env.STRIPE_PRICE_MONTHLY!;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, has_used_trial, credits")
    .eq("id", user.id)
    .single();

  if (isTrial && profile?.has_used_trial) {
    return Response.json({ error: "Free trial already used" }, { status: 400 });
  }

  let customerId = profile?.stripe_customer_id as string | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?success=${isTrial ? "trial" : "true"}`,
    cancel_url: `${origin}/#pricing`,
    metadata: { user_id: user.id, plan: billingPlan, is_trial: isTrial ? "true" : "false" },
  };

  if (isTrial) {
    sessionParams.subscription_data = { trial_period_days: 7 };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return Response.json({ url: session.url });
}
