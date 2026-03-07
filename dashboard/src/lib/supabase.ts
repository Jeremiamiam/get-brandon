import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DashboardClient = {
  id: string;
  slug: string;
  name: string;
  outputs: {
    brief_strategique?: boolean;
    platform?: boolean;
    campaign?: boolean;
    site?: boolean;
    wiki?: boolean;
  };
  progress: string | null;
  updated_at: string;
};

export type DashboardWiki = {
  id: string;
  client_slug: string;
  html_content: string | null;
  updated_at: string;
};
