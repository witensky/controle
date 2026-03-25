
import { createClient, PostgrestError } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://rhutpcvkzioepxiutwjd.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_nzwluSeOy1VFdVf0wFxn6Q_CH63ewii';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'jb-discipline-control-v3.2' }
  }
});

/**
 * Interface standard pour les réponses de données avec gestion d'erreur intégrée.
 */
export interface DbResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

/**
 * Exécute une opération Supabase de manière sécurisée avec capture d'erreur centralisée.
 */
export async function safeDbQuery<T>(queryPromise: Promise<{ data: T | null; error: PostgrestError | null }>): Promise<DbResponse<T>> {
  try {
    const { data, error } = await queryPromise;
    if (error) {
      console.error(`[Supabase Error ${error.code}]: ${error.message}`, error.details);
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.error('[Database Exception]:', err);
    return { data: null, error: err instanceof Error ? err : new Error('Unknown DB Exception') };
  }
}

/**
 * Aide à la gestion des erreurs pour l'utilisateur final.
 */
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`[Supabase ${context}]`, error);
  // On évite les alertes intrusives pour les erreurs de type "Not Found" attendues
  if (error?.code === 'PGRST116') return null;
  return error;
};

/**
 * Utilitaire pour l'abonnement temps réel aux tables principales.
 */
export const subscribeToTable = (table: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
};
