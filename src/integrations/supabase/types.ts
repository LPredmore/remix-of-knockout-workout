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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      evergreen_keywords: {
        Row: {
          category: string | null
          high_impact_synonyms: string[]
          id: number
          primary_keyword: string
        }
        Insert: {
          category?: string | null
          high_impact_synonyms: string[]
          id?: number
          primary_keyword: string
        }
        Update: {
          category?: string | null
          high_impact_synonyms?: string[]
          id?: number
          primary_keyword?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string
          id: string
          post_id: string
          slide_index: number | null
          type: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          slide_index?: number | null
          type?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          slide_index?: number | null
          type?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      parable_post_rules: {
        Row: {
          created_at: string
          id: number
          slide_1: string | null
          slide_2: string | null
          slide_3: string | null
          slide_4: string | null
          slide_5: string | null
          slide_6: string | null
          slide_7: string | null
          slide_character_limits: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          slide_1?: string | null
          slide_2?: string | null
          slide_3?: string | null
          slide_4?: string | null
          slide_5?: string | null
          slide_6?: string | null
          slide_7?: string | null
          slide_character_limits?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          slide_1?: string | null
          slide_2?: string | null
          slide_3?: string | null
          slide_4?: string | null
          slide_5?: string | null
          slide_6?: string | null
          slide_7?: string | null
          slide_character_limits?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content_type: string
          created_at: string
          hashtags: string | null
          id: string
          input_text: string | null
          keyword_paragraph: string | null
          long_description: string | null
          short_caption: string | null
          status: string | null
          target_audience_override: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          hashtags?: string | null
          id?: string
          input_text?: string | null
          keyword_paragraph?: string | null
          long_description?: string | null
          short_caption?: string | null
          status?: string | null
          target_audience_override?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          hashtags?: string | null
          id?: string
          input_text?: string | null
          keyword_paragraph?: string | null
          long_description?: string | null
          short_caption?: string | null
          status?: string | null
          target_audience_override?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_post_rules: {
        Row: {
          created_at: string
          id: number
          slide_1: string | null
          slide_2: string | null
          slide_3: string | null
          slide_4: string | null
          slide_5: string | null
          slide_6: string | null
          slide_7: string | null
          slide_character_limits: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          slide_1?: string | null
          slide_2?: string | null
          slide_3?: string | null
          slide_4?: string | null
          slide_5?: string | null
          slide_6?: string | null
          slide_7?: string | null
          slide_character_limits?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          slide_1?: string | null
          slide_2?: string | null
          slide_3?: string | null
          slide_4?: string | null
          slide_5?: string | null
          slide_6?: string | null
          slide_7?: string | null
          slide_character_limits?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_post_rules: {
        Row: {
          created_at: string
          id: number
          slide_1: string | null
          slide_2: string | null
          slide_3: string | null
          slide_4: string | null
          slide_5: string | null
          slide_6: string | null
          slide_7: string | null
          slide_character_limits: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          slide_1?: string | null
          slide_2?: string | null
          slide_3?: string | null
          slide_4?: string | null
          slide_5?: string | null
          slide_6?: string | null
          slide_7?: string | null
          slide_character_limits?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          slide_1?: string | null
          slide_2?: string | null
          slide_3?: string | null
          slide_4?: string | null
          slide_5?: string | null
          slide_6?: string | null
          slide_7?: string | null
          slide_character_limits?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      research_post_rules: {
        Row: {
          created_at: string
          id: number
          slide_1: string | null
          slide_2: string | null
          slide_3: string | null
          slide_4: string | null
          slide_5: string | null
          slide_6: string | null
          slide_7: string | null
          slide_character_limits: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          slide_1?: string | null
          slide_2?: string | null
          slide_3?: string | null
          slide_4?: string | null
          slide_5?: string | null
          slide_6?: string | null
          slide_7?: string | null
          slide_character_limits?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          slide_1?: string | null
          slide_2?: string | null
          slide_3?: string | null
          slide_4?: string | null
          slide_5?: string | null
          slide_6?: string | null
          slide_7?: string | null
          slide_character_limits?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          default_target_audience: string | null
          global_rules: string | null
          id: string
          image_mode: string | null
          proverbs_image_style_per_slide: string | null
          proverbs_image_style_single: string | null
          quotes_image_style_per_slide: string | null
          quotes_image_style_single: string | null
          research_image_style_per_slide: string | null
          research_image_style_single: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          default_target_audience?: string | null
          global_rules?: string | null
          id?: string
          image_mode?: string | null
          proverbs_image_style_per_slide?: string | null
          proverbs_image_style_single?: string | null
          quotes_image_style_per_slide?: string | null
          quotes_image_style_single?: string | null
          research_image_style_per_slide?: string | null
          research_image_style_single?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          default_target_audience?: string | null
          global_rules?: string | null
          id?: string
          image_mode?: string | null
          proverbs_image_style_per_slide?: string | null
          proverbs_image_style_single?: string | null
          quotes_image_style_per_slide?: string | null
          quotes_image_style_single?: string | null
          research_image_style_per_slide?: string | null
          research_image_style_single?: string | null
          user_id?: string
        }
        Relationships: []
      }
      slides: {
        Row: {
          created_at: string
          id: string
          post_id: string
          role: string | null
          slide_index: number
          text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          role?: string | null
          slide_index: number
          text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          role?: string | null
          slide_index?: number
          text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slides_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
