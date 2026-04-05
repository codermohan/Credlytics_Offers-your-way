import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const STRIPE_PRICE_PRO_ID = Deno.env.get("STRIPE_PRICE_PRO_ID");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
  throw new Error("Missing required webhook environment variables.");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const mapStripeStatus = (status: Stripe.Subscription.Status): "active" | "inactive" | "canceled" | "past_due" | "trialing" => {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  if (status === "past_due") return "past_due";
  if (status === "canceled") return "canceled";
  return "inactive";
};

const toIso = (epochSeconds: number | null | undefined) =>
  epochSeconds ? new Date(epochSeconds * 1000).toISOString() : null;

const getCustomerId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined
) => (typeof customer === "string" ? customer : customer?.id ?? null);

const resolveTierFromPrice = (priceId: string | null | undefined) => {
  if (STRIPE_PRICE_PRO_ID && priceId === STRIPE_PRICE_PRO_ID) {
    return "pro";
  }
  return "premium";
};

const findUserIdByCustomer = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  stripeCustomerId: string
) => {
  const { data } = await supabaseAdmin
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  return data?.user_id ?? null;
};

const applySubscriptionState = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription,
  userIdHint?: string | null
) => {
  const stripeCustomerId = getCustomerId(subscription.customer);
  if (!stripeCustomerId) return;

  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const tier = resolveTierFromPrice(priceId);
  const mappedStatus = mapStripeStatus(subscription.status);
  const periodEnd = toIso(subscription.current_period_end);

  let targetUserId = await findUserIdByCustomer(supabaseAdmin, stripeCustomerId);
  if (!targetUserId && userIdHint) targetUserId = userIdHint;
  if (!targetUserId) {
    console.warn("Could not map Stripe customer to a user", stripeCustomerId);
    return;
  }

  const { error } = await supabaseAdmin.from("user_subscriptions").upsert(
    {
      user_id: targetUserId,
      tier,
      status: mappedStatus,
      expires_at: periodEnd,
      current_period_end: periodEnd,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw error;
  }
};

const applyCanceledSubscriptionState = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription
) => {
  const stripeCustomerId = getCustomerId(subscription.customer);
  if (!stripeCustomerId) return;

  const targetUserId = await findUserIdByCustomer(supabaseAdmin, stripeCustomerId);
  if (!targetUserId) return;

  const { error } = await supabaseAdmin
    .from("user_subscriptions")
    .update({
      tier: "free",
      status: "canceled",
      expires_at: toIso(subscription.ended_at) ?? toIso(subscription.current_period_end) ?? new Date().toISOString(),
      current_period_end: toIso(subscription.current_period_end),
      stripe_subscription_id: null,
      stripe_price_id: null,
      cancel_at_period_end: true,
    })
    .eq("user_id", targetUserId);

  if (error) {
    throw error;
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400, headers: corsHeaders });
  }

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET,
      undefined,
      cryptoProvider
    );
  } catch (error) {
    console.error("Invalid webhook signature", error);
    return new Response("Invalid signature", { status: 400, headers: corsHeaders });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { data: existingEvent } = await supabaseAdmin
      .from("billing_webhook_events")
      .select("id, processed_at")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existingEvent?.processed_at) {
      return new Response("Already processed", { status: 200, headers: corsHeaders });
    }

    let webhookEventRowId = existingEvent?.id ?? null;
    if (!webhookEventRowId) {
      const { data: insertedEvent, error: insertError } = await supabaseAdmin
        .from("billing_webhook_events")
        .insert({
          stripe_event_id: event.id,
          event_type: event.type,
          payload: event as unknown as Record<string, unknown>,
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }
      webhookEventRowId = insertedEvent.id;
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
        const userIdHint = session.metadata?.supabase_user_id ?? null;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await applySubscriptionState(supabaseAdmin, subscription, userIdHint);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userIdHint = subscription.metadata?.supabase_user_id ?? null;
        await applySubscriptionState(supabaseAdmin, subscription, userIdHint);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await applyCanceledSubscriptionState(supabaseAdmin, subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeCustomerId = getCustomerId(invoice.customer);
        if (stripeCustomerId) {
          const targetUserId = await findUserIdByCustomer(supabaseAdmin, stripeCustomerId);
          if (targetUserId) {
            await supabaseAdmin
              .from("user_subscriptions")
              .update({ status: "past_due" })
              .eq("user_id", targetUserId);
          }
        }
        break;
      }

      default:
        break;
    }

    if (webhookEventRowId) {
      await supabaseAdmin
        .from("billing_webhook_events")
        .update({ processed_at: new Date().toISOString() })
        .eq("id", webhookEventRowId);
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Stripe webhook processing error", error);
    return new Response("Webhook processing failed", { status: 500, headers: corsHeaders });
  }
});
