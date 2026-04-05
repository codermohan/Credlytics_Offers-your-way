import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_PRICE_PREMIUM_ID = Deno.env.get("STRIPE_PRICE_PREMIUM_ID");
const STRIPE_PRICE_PRO_ID = Deno.env.get("STRIPE_PRICE_PRO_ID");
const APP_SITE_URL = Deno.env.get("APP_SITE_URL") ?? "http://localhost:8080";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !STRIPE_SECRET_KEY) {
  throw new Error("Missing required function environment variables.");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return jsonResponse({ error: "Missing Authorization header" }, 401);
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authorization } },
    });
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized user" }, 401);
    }

    const body = await req.json().catch(() => ({} as { tier?: string }));
    const requestedTier = body?.tier === "pro" ? "pro" : "premium";

    const priceId =
      requestedTier === "pro"
        ? STRIPE_PRICE_PRO_ID ?? STRIPE_PRICE_PREMIUM_ID
        : STRIPE_PRICE_PREMIUM_ID;

    if (!priceId) {
      return jsonResponse(
        { error: "Missing Stripe price config. Set STRIPE_PRICE_PREMIUM_ID (and optional STRIPE_PRICE_PRO_ID)." },
        500
      );
    }

    const { data: existingSubscription, error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError) {
      console.error("Failed to fetch subscription row", subError);
      return jsonResponse({ error: "Could not load subscription" }, 500);
    }

    let stripeCustomerId = existingSubscription?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      stripeCustomerId = customer.id;
    }

    const { error: upsertError } = await supabaseAdmin.from("user_subscriptions").upsert(
      {
        user_id: user.id,
        tier: "free",
        status: "active",
        stripe_customer_id: stripeCustomerId,
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      console.error("Failed to upsert subscription", upsertError);
      return jsonResponse({ error: "Could not prepare checkout session" }, 500);
    }

    const origin = req.headers.get("origin");
    const siteUrl = origin && origin.startsWith("http") ? origin : APP_SITE_URL;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/profile?billing=success`,
      cancel_url: `${siteUrl}/profile?billing=cancel`,
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: user.id,
        tier: requestedTier,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier: requestedTier,
        },
      },
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error("create-checkout-session error", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return jsonResponse({ error: message }, 500);
  }
});
