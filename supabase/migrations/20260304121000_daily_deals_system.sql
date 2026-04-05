-- Daily deals and merchant offers system.
-- This migration adds backend objects required by src/pages/DailyDeals.tsx.

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.merchant_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'Tag',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.merchant_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  is_national BOOLEAN NOT NULL DEFAULT true,
  accepted_networks TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.daily_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.merchant_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  deal_type TEXT NOT NULL,
  offer_value TEXT NOT NULL,
  promo_code TEXT,
  redemption_instructions TEXT NOT NULL DEFAULT '',
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  deal_score INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  claim_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_deal_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_categories UUID[] NOT NULL DEFAULT '{}',
  favorite_merchants UUID[] NOT NULL DEFAULT '{}',
  blocked_merchants UUID[] NOT NULL DEFAULT '{}',
  max_deals_per_day INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_deal_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES public.daily_deals(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('viewed', 'clicked', 'saved', 'claimed', 'redeemed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_saved_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES public.daily_deals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_saved_deals_user_deal_unique UNIQUE (user_id, deal_id)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_deal_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_deal_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_deals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_subscriptions' AND policyname = 'Users can view their own subscription'
  ) THEN
    CREATE POLICY "Users can view their own subscription"
      ON public.user_subscriptions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_subscriptions' AND policyname = 'Users can create their own subscription'
  ) THEN
    CREATE POLICY "Users can create their own subscription"
      ON public.user_subscriptions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_subscriptions' AND policyname = 'Users can update their own subscription'
  ) THEN
    CREATE POLICY "Users can update their own subscription"
      ON public.user_subscriptions
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'merchant_categories' AND policyname = 'Authenticated users can view active categories'
  ) THEN
    CREATE POLICY "Authenticated users can view active categories"
      ON public.merchant_categories
      FOR SELECT
      TO authenticated
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'merchants' AND policyname = 'Authenticated users can view active merchants'
  ) THEN
    CREATE POLICY "Authenticated users can view active merchants"
      ON public.merchants
      FOR SELECT
      TO authenticated
      USING (is_active = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'daily_deals' AND policyname = 'Authenticated users can view active deals'
  ) THEN
    CREATE POLICY "Authenticated users can view active deals"
      ON public.daily_deals
      FOR SELECT
      TO authenticated
      USING (
        is_active = true
        AND valid_from <= now()
        AND (valid_until IS NULL OR valid_until >= now())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_deal_preferences' AND policyname = 'Users can view their own deal preferences'
  ) THEN
    CREATE POLICY "Users can view their own deal preferences"
      ON public.user_deal_preferences
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_deal_preferences' AND policyname = 'Users can create their own deal preferences'
  ) THEN
    CREATE POLICY "Users can create their own deal preferences"
      ON public.user_deal_preferences
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_deal_preferences' AND policyname = 'Users can update their own deal preferences'
  ) THEN
    CREATE POLICY "Users can update their own deal preferences"
      ON public.user_deal_preferences
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_deal_interactions' AND policyname = 'Users can view their own deal interactions'
  ) THEN
    CREATE POLICY "Users can view their own deal interactions"
      ON public.user_deal_interactions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_deal_interactions' AND policyname = 'Users can create their own deal interactions'
  ) THEN
    CREATE POLICY "Users can create their own deal interactions"
      ON public.user_deal_interactions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_saved_deals' AND policyname = 'Users can view their own saved deals'
  ) THEN
    CREATE POLICY "Users can view their own saved deals"
      ON public.user_saved_deals
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_saved_deals' AND policyname = 'Users can save their own deals'
  ) THEN
    CREATE POLICY "Users can save their own deals"
      ON public.user_saved_deals
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_saved_deals' AND policyname = 'Users can remove their own saved deals'
  ) THEN
    CREATE POLICY "Users can remove their own saved deals"
      ON public.user_saved_deals
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_categories_slug ON public.merchant_categories(slug);
CREATE INDEX IF NOT EXISTS idx_merchants_category_id ON public.merchants(category_id);
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON public.merchants(slug);
CREATE INDEX IF NOT EXISTS idx_daily_deals_category_id ON public.daily_deals(category_id);
CREATE INDEX IF NOT EXISTS idx_daily_deals_merchant_id ON public.daily_deals(merchant_id);
CREATE INDEX IF NOT EXISTS idx_daily_deals_active_window ON public.daily_deals(is_active, valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_user_deal_interactions_user_id ON public.user_deal_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_deal_interactions_deal_id ON public.user_deal_interactions(deal_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_deals_user_id ON public.user_saved_deals(user_id);

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_deal_preferences_updated_at ON public.user_deal_preferences;
CREATE TRIGGER update_user_deal_preferences_updated_at
  BEFORE UPDATE ON public.user_deal_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_deals_updated_at ON public.daily_deals;
CREATE TRIGGER update_daily_deals_updated_at
  BEFORE UPDATE ON public.daily_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_personalized_deals(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  deal_id UUID,
  merchant_name TEXT,
  merchant_logo TEXT,
  category_name TEXT,
  title TEXT,
  description TEXT,
  deal_type TEXT,
  offer_value TEXT,
  promo_code TEXT,
  redemption_instructions TEXT,
  valid_until TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_featured BOOLEAN,
  deal_score INTEGER,
  relevance_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_premium BOOLEAN := false;
  v_limit INTEGER := GREATEST(1, LEAST(COALESCE(p_limit, 50), 100));
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized access to personalized deals';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions us
    WHERE us.user_id = p_user_id
      AND us.tier IN ('premium', 'pro')
      AND us.status = 'active'
      AND (us.expires_at IS NULL OR us.expires_at > now())
  ) INTO v_is_premium;

  RETURN QUERY
  WITH prefs AS (
    SELECT
      udp.preferred_categories,
      udp.favorite_merchants,
      udp.blocked_merchants
    FROM public.user_deal_preferences udp
    WHERE udp.user_id = p_user_id
  )
  SELECT
    d.id AS deal_id,
    m.name AS merchant_name,
    COALESCE(m.logo_url, '') AS merchant_logo,
    c.name AS category_name,
    d.title,
    d.description,
    d.deal_type,
    d.offer_value,
    d.promo_code,
    d.redemption_instructions,
    d.valid_until,
    d.expires_at,
    d.is_featured,
    d.deal_score,
    (
      d.deal_score
      + CASE WHEN d.is_featured THEN 20 ELSE 0 END
      + CASE WHEN d.category_id = ANY(COALESCE(p.preferred_categories, ARRAY[]::UUID[])) THEN 15 ELSE 0 END
      + CASE WHEN d.merchant_id = ANY(COALESCE(p.favorite_merchants, ARRAY[]::UUID[])) THEN 15 ELSE 0 END
    )::NUMERIC AS relevance_score
  FROM public.daily_deals d
  JOIN public.merchants m ON m.id = d.merchant_id
  JOIN public.merchant_categories c ON c.id = d.category_id
  LEFT JOIN prefs p ON true
  WHERE d.is_active = true
    AND d.valid_from <= now()
    AND (d.valid_until IS NULL OR d.valid_until >= now())
    AND NOT (d.merchant_id = ANY(COALESCE(p.blocked_merchants, ARRAY[]::UUID[])))
    AND (v_is_premium OR d.is_featured = true)
  ORDER BY relevance_score DESC, d.is_featured DESC, d.created_at DESC
  LIMIT v_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_deal_interaction(
  p_user_id UUID,
  p_deal_id UUID,
  p_interaction_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized interaction write';
  END IF;

  IF p_interaction_type NOT IN ('viewed', 'clicked', 'saved', 'claimed', 'redeemed') THEN
    RAISE EXCEPTION 'Invalid interaction type: %', p_interaction_type;
  END IF;

  INSERT INTO public.user_deal_interactions (user_id, deal_id, interaction_type)
  VALUES (p_user_id, p_deal_id, p_interaction_type);

  IF p_interaction_type IN ('viewed', 'clicked') THEN
    UPDATE public.daily_deals
    SET view_count = view_count + 1,
        updated_at = now()
    WHERE id = p_deal_id;
  ELSIF p_interaction_type IN ('claimed', 'redeemed') THEN
    UPDATE public.daily_deals
    SET claim_count = claim_count + 1,
        updated_at = now()
    WHERE id = p_deal_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_personalized_deals(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_deal_interaction(UUID, UUID, TEXT) TO authenticated;

INSERT INTO public.user_subscriptions (user_id, tier, status)
SELECT id, 'free', 'active'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.merchant_categories (name, slug, icon, sort_order)
VALUES
  ('Dining & Restaurants', 'dining', 'UtensilsCrossed', 1),
  ('Fast Food', 'fast-food', 'ShoppingBag', 2),
  ('Coffee & Cafes', 'coffee', 'Coffee', 3),
  ('Shopping & Retail', 'shopping', 'Tag', 4),
  ('Online Shopping', 'online-shopping', 'ShoppingBag', 5),
  ('Travel & Hotels', 'travel', 'Plane', 6),
  ('Free Stuff', 'free-stuff', 'Gift', 7)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order,
    is_active = true;

INSERT INTO public.merchants (name, slug, category_id, logo_url, website_url, is_national, accepted_networks)
VALUES
  (
    'Chipotle Mexican Grill',
    'chipotle',
    (SELECT id FROM public.merchant_categories WHERE slug = 'fast-food'),
    'https://logo.clearbit.com/chipotle.com',
    'https://www.chipotle.com',
    true,
    ARRAY['Visa', 'Mastercard', 'Amex', 'Discover']
  ),
  (
    'Starbucks',
    'starbucks',
    (SELECT id FROM public.merchant_categories WHERE slug = 'coffee'),
    'https://logo.clearbit.com/starbucks.com',
    'https://www.starbucks.com',
    true,
    ARRAY['Visa', 'Mastercard', 'Amex', 'Discover']
  ),
  (
    'Uber Eats',
    'uber-eats',
    (SELECT id FROM public.merchant_categories WHERE slug = 'online-shopping'),
    'https://logo.clearbit.com/ubereats.com',
    'https://www.ubereats.com',
    true,
    ARRAY['Visa', 'Mastercard', 'Amex', 'Discover']
  ),
  (
    'DoorDash',
    'doordash',
    (SELECT id FROM public.merchant_categories WHERE slug = 'online-shopping'),
    'https://logo.clearbit.com/doordash.com',
    'https://www.doordash.com',
    true,
    ARRAY['Visa', 'Mastercard', 'Amex', 'Discover']
  ),
  (
    'Target',
    'target',
    (SELECT id FROM public.merchant_categories WHERE slug = 'shopping'),
    'https://logo.clearbit.com/target.com',
    'https://www.target.com',
    true,
    ARRAY['Visa', 'Mastercard', 'Amex', 'Discover']
  ),
  (
    'Amazon',
    'amazon',
    (SELECT id FROM public.merchant_categories WHERE slug = 'online-shopping'),
    'https://logo.clearbit.com/amazon.com',
    'https://www.amazon.com',
    true,
    ARRAY['Visa', 'Mastercard', 'Amex', 'Discover']
  )
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    logo_url = EXCLUDED.logo_url,
    website_url = EXCLUDED.website_url,
    is_active = true;

INSERT INTO public.daily_deals (
  merchant_id,
  category_id,
  title,
  description,
  deal_type,
  offer_value,
  promo_code,
  redemption_instructions,
  valid_from,
  valid_until,
  expires_at,
  is_featured,
  deal_score,
  is_active
)
SELECT
  (SELECT id FROM public.merchants WHERE slug = d.merchant_slug),
  (SELECT id FROM public.merchant_categories WHERE slug = d.category_slug),
  d.title,
  d.description,
  d.deal_type,
  d.offer_value,
  d.promo_code,
  d.redemption_instructions,
  now(),
  now() + d.valid_for,
  now() + d.valid_for,
  d.is_featured,
  d.deal_score,
  true
FROM (
  VALUES
    ('chipotle', 'fast-food', 'BOGO Burrito Bowl', 'Buy one burrito bowl and get one free at participating locations.', 'bogo', 'Buy 1 Get 1 Free', 'BOGO2026', 'Apply code in app or show at checkout.', INTERVAL '7 days', true, 95),
    ('chipotle', 'fast-food', 'Free Chips & Queso', 'Get free chips and queso with any entree purchase.', 'free_item', 'Free Chips & Queso', NULL, 'Automatically applied at checkout with eligible entree.', INTERVAL '3 days', true, 90),
    ('starbucks', 'coffee', 'Happy Hour 50% Off', 'Save 50% on handcrafted beverages during happy hour.', 'discount_percent', '50% Off Drinks', NULL, 'Starbucks Rewards membership required.', INTERVAL '1 day', true, 85),
    ('uber-eats', 'online-shopping', '$20 Off Orders $30+', 'Save $20 on your first qualifying Uber Eats order.', 'discount_amount', '$20 Off', 'SAVE20', 'Valid for new users on minimum $30 subtotal.', INTERVAL '14 days', false, 80),
    ('doordash', 'online-shopping', 'Free Delivery Week', 'Enjoy free delivery from select restaurants all week.', 'free_shipping', 'Free Delivery', NULL, 'DashPass may be required on some offers.', INTERVAL '7 days', true, 75),
    ('target', 'shopping', 'Circle Week Up To 50% Off', 'Save up to 50% on thousands of Target Circle items.', 'discount_percent', 'Up To 50% Off', NULL, 'Offer available in app and online while inventory lasts.', INTERVAL '7 days', true, 90),
    ('amazon', 'online-shopping', 'Prime 30-Day Free Trial', 'Start a free 30-day Amazon Prime trial.', 'free_trial', '30 Days Free', NULL, 'New Prime members only. Cancel anytime.', INTERVAL '30 days', true, 85)
) AS d(merchant_slug, category_slug, title, description, deal_type, offer_value, promo_code, redemption_instructions, valid_for, is_featured, deal_score)
WHERE NOT EXISTS (SELECT 1 FROM public.daily_deals);
