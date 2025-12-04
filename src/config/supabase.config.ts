/**
 * Supabase Configuration
 * Creates and exports the Supabase client instance
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from './env.config.js';

/**
 * Get Supabase client instance
 * Creates a new client with credentials from environment variables
 * Throws error if credentials are missing
 * @returns Supabase client instance
 */
function getSupabaseClient(): SupabaseClient {
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
        );
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
}

/**
 * Supabase client instance
 * Used for database operations and authentication
 * Lazily initialized on first access
 */
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client singleton
 * @returns Supabase client instance
 */
export function getSupabase(): SupabaseClient {
    if (!supabaseInstance) {
        supabaseInstance = getSupabaseClient();
    }
    return supabaseInstance;
}
