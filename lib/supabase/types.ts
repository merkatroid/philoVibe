/**
 * PhiloVibe Supabase Database Types
 * 
 * Run `npx supabase gen types typescript --local > lib/supabase/types.ts`
 * (or use the Supabase dashboard SQL editor + "Generate types") once your
 * schema is applied in production.
 *
 * This is the hand-maintained version with the initial philosophers table.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Note: the 'philosophers' table below is the expanded one for the Encyclopedia (500+ entries).
      // The old RAG philosophers table (if any) can be migrated or kept as a separate table.
      philosophers: {
        Row: {
          id: string;
          name: string;
          birth_death: string | null;
          school_tradition: string | null;
          bio_summary: string | null;
          key_ideas: string[] | null;
          public_domain_works: string | null;
          status: 'historical' | 'contemporary' | 'obscure';
          wikipedia_slug: string | null;
          sep_link: string | null;
          era: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          birth_death?: string | null;
          school_tradition?: string | null;
          bio_summary?: string | null;
          key_ideas?: string[] | null;
          public_domain_works?: string | null;
          status?: 'historical' | 'contemporary' | 'obscure';
          wikipedia_slug?: string | null;
          sep_link?: string | null;
          era?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          birth_death?: string | null;
          school_tradition?: string | null;
          bio_summary?: string | null;
          key_ideas?: string[] | null;
          public_domain_works?: string | null;
          status?: 'historical' | 'contemporary' | 'obscure';
          wikipedia_slug?: string | null;
          sep_link?: string | null;
          era?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      documents: {
        Row: {
          id: string;
          content: string;
          embedding: string; // vector type serialized
          metadata: Json | null;
          source: string | null;
          philosopher_slug: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          embedding: string;
          metadata?: Json | null;
          source?: string | null;
          philosopher_slug?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          embedding?: string;
          metadata?: Json | null;
          source?: string | null;
          philosopher_slug?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      philosophers: {
        Row: {
          id: string;
          name: string;
          birth_death: string | null;
          school_tradition: string | null;
          bio_summary: string | null;
          key_ideas: string[] | null;
          public_domain_works: string | null;
          status: 'historical' | 'contemporary' | 'obscure';
          wikipedia_slug: string | null;
          sep_link: string | null;
          era: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          birth_death?: string | null;
          school_tradition?: string | null;
          bio_summary?: string | null;
          key_ideas?: string[] | null;
          public_domain_works?: string | null;
          status?: 'historical' | 'contemporary' | 'obscure';
          wikipedia_slug?: string | null;
          sep_link?: string | null;
          era?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          birth_death?: string | null;
          school_tradition?: string | null;
          bio_summary?: string | null;
          key_ideas?: string[] | null;
          public_domain_works?: string | null;
          status?: 'historical' | 'contemporary' | 'obscure';
          wikipedia_slug?: string | null;
          sep_link?: string | null;
          era?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      // Future tables (examples)
      // conversations: { ... }
      // messages: { ... }
      // user_progress: { ... }
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_documents: {
        Args: {
          query_embedding: string; // vector as string for rpc
          match_threshold: number;
          match_count: number;
          filter: Json;
        };
        Returns: {
          id: string;
          content: string;
          metadata: Json | null;
          source: string | null;
          philosopher_slug: string | null;
          similarity: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience type aliases
export type Philosopher = Database['public']['Tables']['philosophers']['Row'];
export type PhilosopherInsert = Database['public']['Tables']['philosophers']['Insert'];
