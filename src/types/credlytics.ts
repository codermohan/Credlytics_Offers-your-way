import { Tables } from "@/integrations/supabase/types";

// Card template with benefits
export interface CardTemplateWithBenefits {
  id: string;
  card_key: string;
  name: string;
  issuer: string;
  annual_fee: number;
  card_type: string;
  network: string | null;
  country: string;
  benefits: CardTemplateBenefit[];
}

export interface CardTemplateBenefit {
  id: string;
  title: string;
  description: string | null;
  category: string;
  benefit_type: string;
  value: string | null;
  terms: string | null;
  reset_period: string | null;
}

// User card with template info
export interface UserCardWithTemplate {
  id: string;
  card_template_id: string;
  last_four_digits: string | null;
  color: string;
  nickname: string | null;
  created_at: string;
  template: {
    name: string;
    issuer: string;
    annual_fee: number;
    network: string | null;
    country: string;
  };
}

// User benefit with card info
export interface UserBenefitWithCard {
  id: string;
  user_card_id: string;
  title: string;
  description: string | null;
  category: string;
  benefit_type: string;
  value: string | null;
  terms: string | null;
  reset_period: string | null;
  is_custom: boolean;
  used: boolean;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  card_name?: string;
  card_color?: string;
}

// Benefit category info
export interface BenefitCategory {
  value: string;
  label: string;
  icon: string;
  colorClass: string;
}

export const BENEFIT_CATEGORIES: BenefitCategory[] = [
  { value: 'cashback', label: 'Cashback', icon: '💰', colorClass: 'category-cashback' },
  { value: 'travel', label: 'Travel', icon: '✈️', colorClass: 'category-travel' },
  { value: 'dining', label: 'Dining', icon: '🍽️', colorClass: 'category-dining' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', colorClass: 'category-shopping' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️', colorClass: 'category-insurance' },
  { value: 'lounge', label: 'Lounge Access', icon: '🏨', colorClass: 'category-lounge' },
  { value: 'other', label: 'Other', icon: '🎁', colorClass: 'category-other' },
];

export const getCategoryInfo = (category: string): BenefitCategory => {
  return BENEFIT_CATEGORIES.find(c => c.value === category) || BENEFIT_CATEGORIES[6];
};

// Card gradient colors
export const CARD_COLORS = [
  { value: '#10B981', label: 'Emerald' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#1F2937', label: 'Slate' },
];
