import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
// In a production environment, these would be injected via environment variables
// Remember to connect to Supabase through the Bolt UI to set these up properly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);