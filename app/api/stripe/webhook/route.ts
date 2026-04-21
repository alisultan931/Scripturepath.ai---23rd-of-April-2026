import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function getPeriodEnd(sub: Stripe.Subscription): string | null {
  const ts = sub.items?.data?.[0]?.current_period_end;
  if (typeof ts === "number") return new Date(ts * 1000).toISOString();
  return null;
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook verification failed";
    return Response.json({ error: msg }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;
      const isTrial = session.metadata?.is_trial === "true";

      if (!userId || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      if (isTrial) {
        const { data: profile } = await admin
          .from("profiles")
          .select("credits")
          .eq("id", userId)
          .single();

        const currentCredits = (profile?.credits as number) ?? 0;
        const trialEndsAt = typeof subscription.trial_end === "number"
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null;

        await admin
          .from("profiles")
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: "trialing",
            subscription_plan: plan,
            current_period_end: getPeriodEnd(subscription),
            credits: currentCredits + 10,
            has_used_trial: true,
            trial_ends_at: trialEndsAt,
          })
          .eq("id", userId);
      } else {
        await admin
          .from("profiles")
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_plan: plan,
            current_period_end: getPeriodEnd(subscription),
            credits: 30,
          })
          .eq("id", userId);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const isRenewal = invoice.billing_reason === "subscription_cycle";
      const isFirstCharge = invoice.billing_reason === "subscription_create";

      if (!isRenewal && !isFirstCharge) break;

      const invoiceAny = invoice as unknown as Record<string, unknown>;
      const rawSub = invoiceAny.subscription;
      const subId = typeof rawSub === "string" ? rawSub : (rawSub as { id?: string } | null)?.id;
      if (!subId) break;

      const subscription = await stripe.subscriptions.retrieve(subId);

      // Skip non-trial initial charges — checkout.session.completed already handled those
      if (isFirstCharge && subscription.trial_end === null) break;

      const rawCustomer = invoiceAny.customer;
      const customerId = typeof rawCustomer === "string" ? rawCustomer : (rawCustomer as { id?: string } | null)?.id;
      if (!customerId) break;

      await admin
        .from("profiles")
        .update({
          subscription_status: subscription.status,
          current_period_end: getPeriodEnd(subscription),
          credits: 30,
          // Clear trial fields when trial converts to paid
          ...(isFirstCharge ? { trial_ends_at: null } : {}),
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const status = subscription.cancel_at_period_end
        ? "canceling"
        : subscription.status;

      await admin
        .from("profiles")
        .update({
          subscription_status: status,
          current_period_end: getPeriodEnd(subscription),
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      await admin
        .from("profiles")
        .update({
          subscription_status: "canceled",
          stripe_subscription_id: null,
          subscription_plan: null,
          current_period_end: null,
          trial_ends_at: null,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return Response.json({ received: true });
}
