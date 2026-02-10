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
      cod_orders: {
        Row: {
          city: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          id: string
          items: Json
          notes: string | null
          order_number: string
          shipping_cost: number
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          city: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          shipping_cost?: number
          status?: string
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          shipping_cost?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      digital_tray_products: {
        Row: {
          id: string
          shopify_product_id: string
          shopify_variant_id: string
          handle: string
          title: string
          description: string | null
          vendor: string | null
          price: number
          compare_at_price: number | null
          image_url: string | null
          concern: Database["public"]["Enums"]["skin_concern"]
          step: Database["public"]["Enums"]["regimen_step"]
          is_hero: boolean
          is_bestseller: boolean
          inventory_total: number
          available_for_sale: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shopify_product_id: string
          shopify_variant_id: string
          handle: string
          title: string
          description?: string | null
          vendor?: string | null
          price: number
          compare_at_price?: number | null
          image_url?: string | null
          concern: Database["public"]["Enums"]["skin_concern"]
          step: Database["public"]["Enums"]["regimen_step"]
          is_hero?: boolean
          is_bestseller?: boolean
          inventory_total?: number
          available_for_sale?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shopify_product_id?: string
          shopify_variant_id?: string
          handle?: string
          title?: string
          description?: string | null
          vendor?: string | null
          price?: number
          compare_at_price?: number | null
          image_url?: string | null
          concern?: Database["public"]["Enums"]["skin_concern"]
          step?: Database["public"]["Enums"]["regimen_step"]
          is_hero?: boolean
          is_bestseller?: boolean
          inventory_total?: number
          available_for_sale?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          mfa_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          mfa_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          mfa_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_tray_by_concern: {
        Args: {
          concern_tag: Database["public"]["Enums"]["skin_concern"]
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      sync_tray_product: {
        Args: {
          p_shopify_product_id: string
          p_shopify_variant_id: string
          p_handle: string
          p_title: string
          p_description: string
          p_vendor: string
          p_price: number
          p_compare_at_price: number
          p_image_url: string
          p_concern: Database["public"]["Enums"]["skin_concern"]
          p_step: Database["public"]["Enums"]["regimen_step"]
          p_is_hero: boolean
          p_is_bestseller: boolean
          p_inventory_total: number
          p_available_for_sale: boolean
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      skin_concern: "Concern_Acne" | "Concern_Hydration" | "Concern_AntiAging" | "Concern_Brightening" | "Concern_Sensitivity" | "Concern_SunProtection" | "Concern_DarkCircles"
      regimen_step: "Step_1" | "Step_2" | "Step_3"
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
    Enums: {
      app_role: ["admin", "user"],
      skin_concern: [
        "Concern_Acne",
        "Concern_Hydration",
        "Concern_AntiAging",
        "Concern_Brightening",
        "Concern_Sensitivity",
        "Concern_SunProtection",
        "Concern_DarkCircles",
      ],
      regimen_step: ["Step_1", "Step_2", "Step_3"],
    },
  },
} as const

// ============================================================================
// Digital Tray Types - For frontend consumption
// ============================================================================

/** Valid skin concerns for the Digital Tray */
export type SkinConcern = Database["public"]["Enums"]["skin_concern"];

/** Regimen steps: Cleanse, Treat, Protect */
export type RegimenStep = Database["public"]["Enums"]["regimen_step"];

/** A product in the Digital Tray */
export interface DigitalTrayProduct {
  id: string;
  shopify_product_id: string;
  shopify_variant_id: string;
  handle: string;
  title: string;
  description: string | null;
  vendor: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  step: RegimenStep;
  is_hero: boolean;
  is_bestseller: boolean;
  inventory_total: number;
  step_label: {
    en: string;
    ar: string;
  };
  available: true;
}

/** Fallback slot when product is unavailable */
export interface DigitalTrayFallback {
  available: false;
  step_label: {
    en: string;
    ar: string;
  };
  fallback_message: {
    en: string;
    ar: string;
  };
  fallback_action: "open_chat";
}

/** A slot in the Digital Tray (product or fallback) */
export type DigitalTraySlot = DigitalTrayProduct | DigitalTrayFallback;

/** The complete Digital Tray response from the Edge Function */
export interface DigitalTrayResponse {
  success: true;
  data: {
    concern: {
      key: SkinConcern;
      label: {
        en: string;
        ar: string;
      };
    };
    regimen: {
      step_1: DigitalTraySlot;
      step_2: DigitalTraySlot;
      step_3: DigitalTraySlot;
    };
    generated_at: string;
  };
  meta: {
    version: string;
    cache_ttl: number;
  };
}

/** Error response from the Edge Function */
export interface DigitalTrayErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    valid_concerns: readonly SkinConcern[];
  };
}
