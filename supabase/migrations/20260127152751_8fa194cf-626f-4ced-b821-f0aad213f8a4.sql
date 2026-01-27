-- Create card_templates table for pre-defined credit cards
CREATE TABLE public.card_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  annual_fee INTEGER NOT NULL DEFAULT 0,
  card_type TEXT NOT NULL DEFAULT 'credit',
  network TEXT,
  country TEXT NOT NULL DEFAULT 'US',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create card_template_benefits table for pre-defined benefits
CREATE TABLE public.card_template_benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_template_id UUID NOT NULL REFERENCES public.card_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  benefit_type TEXT NOT NULL DEFAULT 'ongoing',
  value TEXT,
  terms TEXT,
  reset_period TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_cards table for user's added cards
CREATE TABLE public.user_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  card_template_id UUID NOT NULL REFERENCES public.card_templates(id) ON DELETE CASCADE,
  last_four_digits TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_benefits table for tracking benefit usage
CREATE TABLE public.user_benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_card_id UUID NOT NULL REFERENCES public.user_cards(id) ON DELETE CASCADE,
  card_template_benefit_id UUID REFERENCES public.card_template_benefits(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  benefit_type TEXT NOT NULL DEFAULT 'ongoing',
  value TEXT,
  terms TEXT,
  reset_period TEXT,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_notifications table for benefit alerts
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_benefit_id UUID REFERENCES public.user_benefits(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'reminder',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.card_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_template_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Card templates are publicly readable (pre-defined data)
CREATE POLICY "Anyone can view card templates"
  ON public.card_templates FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view card template benefits"
  ON public.card_template_benefits FOR SELECT
  USING (true);

-- User cards: accessible by owner or anonymous users can access their own session data
CREATE POLICY "Users can view their own cards"
  ON public.user_cards FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can create cards"
  ON public.user_cards FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can update their own cards"
  ON public.user_cards FOR UPDATE
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can delete their own cards"
  ON public.user_cards FOR DELETE
  USING (user_id IS NULL OR user_id = auth.uid());

-- User benefits: accessible by owner
CREATE POLICY "Users can view their own benefits"
  ON public.user_benefits FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_cards
    WHERE user_cards.id = user_benefits.user_card_id
    AND (user_cards.user_id IS NULL OR user_cards.user_id = auth.uid())
  ));

CREATE POLICY "Users can create benefits for their cards"
  ON public.user_benefits FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_cards
    WHERE user_cards.id = user_benefits.user_card_id
    AND (user_cards.user_id IS NULL OR user_cards.user_id = auth.uid())
  ));

CREATE POLICY "Users can update their own benefits"
  ON public.user_benefits FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_cards
    WHERE user_cards.id = user_benefits.user_card_id
    AND (user_cards.user_id IS NULL OR user_cards.user_id = auth.uid())
  ));

CREATE POLICY "Users can delete their own benefits"
  ON public.user_benefits FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_cards
    WHERE user_cards.id = user_benefits.user_card_id
    AND (user_cards.user_id IS NULL OR user_cards.user_id = auth.uid())
  ));

-- User notifications: accessible by owner
CREATE POLICY "Users can view their own notifications"
  ON public.user_notifications FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can create notifications"
  ON public.user_notifications FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.user_notifications FOR UPDATE
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON public.user_notifications FOR DELETE
  USING (user_id IS NULL OR user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_card_template_benefits_template_id ON public.card_template_benefits(card_template_id);
CREATE INDEX idx_user_cards_user_id ON public.user_cards(user_id);
CREATE INDEX idx_user_cards_template_id ON public.user_cards(card_template_id);
CREATE INDEX idx_user_benefits_user_card_id ON public.user_benefits(user_card_id);
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_card_templates_country ON public.card_templates(country);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_cards_updated_at
  BEFORE UPDATE ON public.user_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_benefits_updated_at
  BEFORE UPDATE ON public.user_benefits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();