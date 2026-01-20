
import { createClient } from '@supabase/supabase-js';

/**
 * J&B Control Kernel - Supabase Connection Module
 * 
 * IMPORTANT: SUPABASE_URL and SUPABASE_ANON_KEY must be provided in the environment.
 * If missing, we provide placeholders to prevent the application from crashing at boot.
 */
const supabaseUrl = process.env.SUPABASE_URL || 'https://rhutpcvkzioepxiutwjd.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_nzwluSeOy1VFdVf0wFxn6Q_CH63ewii';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
