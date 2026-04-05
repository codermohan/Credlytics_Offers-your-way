-- Production hardening for subscriptions and daily deals access.
-- 1) Prevent clients from self-upgrading subscriptions.
-- 2) Ensure every new auth user gets default subscription/preferences rows.
-- 3) Enforce premium-or-featured visibility at policy level.

-- Backfill defaults for existing users.
INSERT INTO public.user_subscriptions (user_id, tier, status)
SELECT id, 'free', 'active'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_deal_preferences (user_id)
SELECT id
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Remove insecure write access to subscriptions from the client.
DROP POLICY IF EXISTS "Users can create their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;

-- Keep read access to own subscription (idempotent guard).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_subscriptions'
      AND policyname = 'Users can view their own subscription'
  ) THEN
    CREATE POLICY "Users can view their own subscription"
      ON public.user_subscriptions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Replace broad deals policy with premium-or-featured policy.
DROP POLICY IF EXISTS "Authenticated users can view active deals" ON public.daily_deals;
DROP POLICY IF EXISTS "Premium or featured deals are visible to authenticated users" ON public.daily_deals;

CREATE POLICY "Premium or featured deals are visible to authenticated users"
  ON public.daily_deals
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND valid_from <= now()
    AND (valid_until IS NULL OR valid_until >= now())
    AND (
      is_featured = true
      OR EXISTS (
        SELECT 1
        FROM public.user_subscriptions us
        WHERE us.user_id = auth.uid()
          AND us.tier IN ('premium', 'pro')
          AND us.status = 'active'
          AND (us.expires_at IS NULL OR us.expires_at > now())
      )
    )
  );

-- Auto-provision defaults for newly created auth users.
CREATE OR REPLACE FUNCTION public.handle_new_user_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_deal_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_defaults ON auth.users;

CREATE TRIGGER on_auth_user_created_defaults
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_defaults();
