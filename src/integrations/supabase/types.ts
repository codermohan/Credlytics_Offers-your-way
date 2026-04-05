export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      card_template_benefits: {
        Row: {
          benefit_type: string
          card_template_id: string
          category: string
          created_at: string
          description: string | null
          id: string
          reset_period: string | null
          terms: string | null
          title: string
          value: string | null
        }
        Insert: {
          benefit_type?: string
          card_template_id: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          reset_period?: string | null
          terms?: string | null
          title: string
          value?: string | null
        }
        Update: {
          benefit_type?: string
          card_template_id?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          reset_period?: string | null
          terms?: string | null
          title?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_template_benefits_card_template_id_fkey"
            columns: ["card_template_id"]
            isOneToOne: false
            referencedRelation: "card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      card_templates: {
        Row: {
          annual_fee: number
          card_key: string
          card_type: string
          country: string
          created_at: string
          id: string
          issuer: string
          name: string
          network: string | null
        }
        Insert: {
          annual_fee?: number
          card_key: string
          card_type?: string
          country?: string
          created_at?: string
          id?: string
          issuer: string
          name: string
          network?: string | null
        }
        Update: {
          annual_fee?: number
          card_key?: string
          card_type?: string
          country?: string
          created_at?: string
          id?: string
          issuer?: string
          name?: string
          network?: string | null
        }
        Relationships: []
      }
      user_benefits: {
        Row: {
          benefit_type: string
          card_template_benefit_id: string | null
          category: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_custom: boolean
          reset_period: string | null
          terms: string | null
          title: string
          updated_at: string
          used: boolean
          used_at: string | null
          user_card_id: string
          value: string | null
        }
        Insert: {
          benefit_type?: string
          card_template_benefit_id?: string | null
          category: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_custom?: boolean
          reset_period?: string | null
          terms?: string | null
          title: string
          updated_at?: string
          used?: boolean
          used_at?: string | null
          user_card_id: string
          value?: string | null
        }
        Update: {
          benefit_type?: string
          card_template_benefit_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_custom?: boolean
          reset_period?: string | null
          terms?: string | null
          title?: string
          updated_at?: string
          used?: boolean
          used_at?: string | null
          user_card_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_benefits_card_template_benefit_id_fkey"
            columns: ["card_template_benefit_id"]
            isOneToOne: false
            referencedRelation: "card_template_benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_benefits_user_card_id_fkey"
            columns: ["user_card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cards: {
        Row: {
          card_template_id: string
          color: string
          created_at: string
          id: string
          last_four_digits: string | null
          nickname: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          card_template_id: string
          color?: string
          created_at?: string
          id?: string
          last_four_digits?: string | null
          nickname?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          card_template_id?: string
          color?: string
          created_at?: string
          id?: string
          last_four_digits?: string | null
          nickname?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_cards_card_template_id_fkey"
            columns: ["card_template_id"]
            isOneToOne: false
            referencedRelation: "card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          user_benefit_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type?: string
          user_benefit_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          user_benefit_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_benefit_id_fkey"
            columns: ["user_benefit_id"]
            isOneToOne: false
            referencedRelation: "user_benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          payload: Json
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: number
          payload: Json
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: number
          payload?: Json
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          expires_at: string | null
          id: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          expires_at?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          expires_at?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      merchant_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      merchants: {
        Row: {
          accepted_networks: string[]
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          is_national: boolean
          logo_url: string | null
          name: string
          slug: string
          website_url: string | null
        }
        Insert: {
          accepted_networks?: string[]
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_national?: boolean
          logo_url?: string | null
          name: string
          slug: string
          website_url?: string | null
        }
        Update: {
          accepted_networks?: string[]
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_national?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "merchant_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_deals: {
        Row: {
          category_id: string
          claim_count: number
          created_at: string
          deal_score: number
          deal_type: string
          description: string
          expires_at: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          merchant_id: string
          offer_value: string
          promo_code: string | null
          redemption_instructions: string
          title: string
          updated_at: string
          valid_from: string
          valid_until: string | null
          view_count: number
        }
        Insert: {
          category_id: string
          claim_count?: number
          created_at?: string
          deal_score?: number
          deal_type: string
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          merchant_id: string
          offer_value: string
          promo_code?: string | null
          redemption_instructions?: string
          title: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          view_count?: number
        }
        Update: {
          category_id?: string
          claim_count?: number
          created_at?: string
          deal_score?: number
          deal_type?: string
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          merchant_id?: string
          offer_value?: string
          promo_code?: string | null
          redemption_instructions?: string
          title?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_deals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "merchant_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_deals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_deal_preferences: {
        Row: {
          blocked_merchants: string[]
          created_at: string
          favorite_merchants: string[]
          id: string
          max_deals_per_day: number
          preferred_categories: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_merchants?: string[]
          created_at?: string
          favorite_merchants?: string[]
          id?: string
          max_deals_per_day?: number
          preferred_categories?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_merchants?: string[]
          created_at?: string
          favorite_merchants?: string[]
          id?: string
          max_deals_per_day?: number
          preferred_categories?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_deal_interactions: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          interaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          interaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          interaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_deal_interactions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "daily_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_saved_deals: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_deals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "daily_deals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_personalized_deals: {
        Args: {
          p_limit?: number
          p_user_id: string
        }
        Returns: {
          category_name: string
          deal_id: string
          deal_score: number
          deal_type: string
          description: string
          expires_at: string | null
          is_featured: boolean
          merchant_logo: string
          merchant_name: string
          offer_value: string
          promo_code: string | null
          redemption_instructions: string
          relevance_score: number
          title: string
          valid_until: string | null
        }[]
      }
      track_deal_interaction: {
        Args: {
          p_deal_id: string
          p_interaction_type: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
