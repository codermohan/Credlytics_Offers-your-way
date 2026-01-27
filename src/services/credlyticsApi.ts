import { supabase } from "@/integrations/supabase/client";
import { CardTemplateWithBenefits, UserCardWithTemplate, UserBenefitWithCard } from "@/types/credlytics";

// Fetch all card templates with benefits
export const fetchCardTemplates = async (): Promise<CardTemplateWithBenefits[]> => {
  const { data: templates, error: templatesError } = await supabase
    .from("card_templates")
    .select("*")
    .order("name");

  if (templatesError) throw templatesError;

  const { data: benefits, error: benefitsError } = await supabase
    .from("card_template_benefits")
    .select("*");

  if (benefitsError) throw benefitsError;

  return templates.map((template) => ({
    ...template,
    benefits: benefits.filter((b) => b.card_template_id === template.id),
  }));
};

// Fetch user's cards with template info
export const fetchUserCards = async (): Promise<UserCardWithTemplate[]> => {
  const { data: userCards, error: cardsError } = await supabase
    .from("user_cards")
    .select(`
      *,
      card_templates (
        name,
        issuer,
        annual_fee,
        network,
        country
      )
    `)
    .order("created_at", { ascending: false });

  if (cardsError) throw cardsError;

  return userCards.map((card: any) => ({
    id: card.id,
    card_template_id: card.card_template_id,
    last_four_digits: card.last_four_digits,
    color: card.color,
    nickname: card.nickname,
    created_at: card.created_at,
    template: {
      name: card.card_templates.name,
      issuer: card.card_templates.issuer,
      annual_fee: card.card_templates.annual_fee,
      network: card.card_templates.network,
      country: card.card_templates.country,
    },
  }));
};

// Fetch user's benefits
export const fetchUserBenefits = async (userCards: UserCardWithTemplate[]): Promise<UserBenefitWithCard[]> => {
  if (userCards.length === 0) return [];

  const cardIds = userCards.map((c) => c.id);
  
  const { data: benefits, error } = await supabase
    .from("user_benefits")
    .select("*")
    .in("user_card_id", cardIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return benefits.map((benefit) => {
    const card = userCards.find((c) => c.id === benefit.user_card_id);
    return {
      ...benefit,
      card_name: card?.template.name,
      card_color: card?.color,
    };
  });
};

// Add a new user card and auto-import benefits
export const addUserCard = async (
  cardTemplateId: string,
  lastFourDigits: string,
  color: string
): Promise<string> => {
  // Create the user card
  const { data: newCard, error: cardError } = await supabase
    .from("user_cards")
    .insert({
      card_template_id: cardTemplateId,
      last_four_digits: lastFourDigits || null,
      color: color,
    })
    .select()
    .single();

  if (cardError) throw cardError;

  // Fetch template benefits
  const { data: templateBenefits, error: benefitsError } = await supabase
    .from("card_template_benefits")
    .select("*")
    .eq("card_template_id", cardTemplateId);

  if (benefitsError) throw benefitsError;

  // Import benefits for this card
  if (templateBenefits && templateBenefits.length > 0) {
    const benefitsToInsert = templateBenefits.map((b) => ({
      user_card_id: newCard.id,
      card_template_benefit_id: b.id,
      title: b.title,
      description: b.description,
      category: b.category,
      benefit_type: b.benefit_type,
      value: b.value,
      terms: b.terms,
      reset_period: b.reset_period,
      is_custom: false,
    }));

    const { error: insertError } = await supabase
      .from("user_benefits")
      .insert(benefitsToInsert);

    if (insertError) throw insertError;
  }

  return newCard.id;
};

// Delete a user card (and cascading benefits)
export const deleteUserCard = async (cardId: string): Promise<void> => {
  const { error } = await supabase
    .from("user_cards")
    .delete()
    .eq("id", cardId);

  if (error) throw error;
};

// Toggle benefit used status
export const toggleBenefitUsed = async (benefitId: string, currentUsed: boolean): Promise<void> => {
  const { error } = await supabase
    .from("user_benefits")
    .update({
      used: !currentUsed,
      used_at: !currentUsed ? new Date().toISOString() : null,
    })
    .eq("id", benefitId);

  if (error) throw error;
};

// Delete a benefit
export const deleteBenefit = async (benefitId: string): Promise<void> => {
  const { error } = await supabase
    .from("user_benefits")
    .delete()
    .eq("id", benefitId);

  if (error) throw error;
};

// Fetch notifications
export const fetchNotifications = async () => {
  const { data, error } = await supabase
    .from("user_notifications")
    .select("*")
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
