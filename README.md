# Credlytics

Credlytics helps users track credit card benefits and discover daily merchant deals.

## Stack

- Vite + React + TypeScript
- Supabase (Auth + Postgres + RLS)
- Tailwind + shadcn/ui
- Vitest + Playwright

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env
```

3. Fill required keys in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Optional:

- `VITE_BILLING_UPGRADE_URL`
- `VITE_BILLING_PORTAL_URL`

4. Run app:

```bash
npm run dev
```

## Database setup (Supabase)

Apply migrations in order:

1. `supabase/migrations/20260127152751_8fa194cf-626f-4ced-b821-f0aad213f8a4.sql`
2. `supabase/migrations/20260304121000_daily_deals_system.sql`
3. `supabase/migrations/20260405100000_production_hardening.sql`
4. `supabase/migrations/20260405123000_billing_integration.sql`

The hardening migration:

- auto-creates default subscription + deal preference rows for new users
- prevents client-side self-upgrade of subscription tier
- enforces premium-or-featured daily-deals visibility

## Stripe billing hooks (Supabase Edge Functions)

Functions added:

- `create-checkout-session`
- `create-billing-portal-session`
- `stripe-webhook`

Set required secrets in Supabase project:

```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_live_xxx \
  STRIPE_WEBHOOK_SECRET=whsec_xxx \
  STRIPE_PRICE_PREMIUM_ID=price_xxx \
  STRIPE_PRICE_PRO_ID=price_xxx \
  APP_SITE_URL=https://your-domain.com
```

Deploy functions:

```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-billing-portal-session
supabase functions deploy stripe-webhook
```

Configure Stripe webhook endpoint:

- URL: `https://<project-ref>.functions.supabase.co/stripe-webhook`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

After webhook delivery, `public.user_subscriptions` is updated automatically.

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run typecheck` - TypeScript check
- `npm run lint` - lint code
- `npm run test` - unit tests (Vitest)
- `npm run e2e` - Playwright E2E suite

## Deploy today

### Option A: Vercel

1. Import repo into Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add env vars from `.env.example`.
5. Deploy.

`vercel.json` is included for SPA route rewrites.

### Option B: Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add env vars from `.env.example`.
4. Deploy.

`public/_redirects` is included for SPA route rewrites.

## Pre-deploy checklist

- `npm run lint` passes
- `npm run typecheck` passes
- `npm run test` passes
- `npm run e2e` passes
- Supabase migrations applied on production project
- Supabase edge functions deployed and Stripe webhook configured
- Vercel/Netlify env vars configured


#The basic idea of my app is to make all deals and Credit card offers available to everyone who are missing. In future will add feature to add new offers or offers where only applicable locally or local owned shops to be submitted or added like a community or a board based on the area.