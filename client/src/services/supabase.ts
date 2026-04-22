import {createClient, SupabaseClient} from '@supabase/supabase-js'

const supabaseURL: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseURL, supabaseAnonKey)
