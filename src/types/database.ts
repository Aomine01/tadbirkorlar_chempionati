export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone_number: string;
          role: "applicant" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone_number: string;
          role?: "applicant" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone_number?: string;
          role?: "applicant" | "admin";
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          category: "ideas" | "startup" | "business";
          age: number;
          region: string;
          brand_name: string;
          legal_name: string;
          business_description: string;
          goals: string[];
          potential_impact: string[];
          avatar_url: string | null;
          product_image_url: string | null;
          product_image_urls: string[] | string;
          status: "submitted" | "under_review" | "approved" | "rejected";
          gender: "male" | "female";
          rejection_comment: string | null;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: "ideas" | "startup" | "business";
          age: number;
          region: string;
          brand_name: string;
          legal_name: string;
          business_description: string;
          goals: string[];
          potential_impact: string[];
          avatar_url?: string | null;
          product_image_url?: string | null;
          product_image_urls?: string[] | string;
          status?: "submitted" | "under_review" | "approved" | "rejected";
          gender?: "male" | "female";
          rejection_comment?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: "ideas" | "startup" | "business";
          age?: number;
          region?: string;
          brand_name?: string;
          legal_name?: string;
          business_description?: string;
          goals?: string[];
          potential_impact?: string[];
          avatar_url?: string | null;
          product_image_url?: string | null;
          product_image_urls?: string[] | string;
          status?: "submitted" | "under_review" | "approved" | "rejected";
          gender?: "male" | "female";
          rejection_comment?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Application = Database["public"]["Tables"]["applications"]["Row"];
export type ApplicationInsert =
  Database["public"]["Tables"]["applications"]["Insert"];
export type ApplicationStatus = Application["status"];
export type ApplicationCategory = Application["category"];
