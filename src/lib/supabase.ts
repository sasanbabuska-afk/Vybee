import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { Database } from '../types/database';

/**
 * Configuration resolver for Supabase
 * Safely extracts environment variables across Vite, Next.js, and Node.js environments
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

/**
 * Safely retrieves public/anon Supabase credentials.
 * NEVER exposes or reads service_role keys in browser bundles.
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  // Safe environment accessor supporting Vite (import.meta.env) and Node (process.env)
  let url = '';
  let anonKey = '';

  // 1. Check Vite import.meta.env (Client/Browser bundle)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      url =
        import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
        '';
      anonKey =
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        '';
    }
  } catch {
    // Ignore in non-Vite / pure Node environments
  }

  // 2. Check Node process.env fallback (Server-side execution)
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (!url) {
        url =
          process.env.VITE_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.SUPABASE_URL ||
          '';
      }
      if (!anonKey) {
        anonKey =
          process.env.VITE_SUPABASE_ANON_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          process.env.SUPABASE_ANON_KEY ||
          '';
      }
    }
  } catch {
    // Ignore in pure browser environments
  }

  // Validate that credentials are valid real strings (not default placeholders)
  const isPlaceholderUrl =
    !url ||
    url.includes('your-project') ||
    url.includes('placeholder') ||
    url === 'https://example.supabase.co';

  const isPlaceholderKey =
    !anonKey ||
    anonKey.includes('your-anon-key') ||
    anonKey.includes('your-supabase') ||
    anonKey === 'placeholder';

  const isConfigured = !isPlaceholderUrl && !isPlaceholderKey && url.startsWith('http');

  return {
    url: isConfigured ? url : '',
    anonKey: isConfigured ? anonKey : '',
    isConfigured
  };
};

/**
 * Checks whether Supabase is configured with active credentials.
 */
export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured;
};

// Singleton instance for browser client
let browserClientInstance: SupabaseClient<Database> | null = null;

/**
 * Production-ready Browser Supabase Client
 * - Uses public anon key only
 * - Configures persistent localStorage session management
 * - Enables automatic token refresh and session recovery from URL
 */
export const createBrowserSupabaseClient = (
  customOptions?: SupabaseClientOptions<'public'>
): SupabaseClient<Database> | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  const isBrowser = typeof window !== 'undefined';

  const defaultOptions: SupabaseClientOptions<'public'> = {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
      storage: isBrowser ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'x-application-name': 'vybe-web-app'
      }
    }
  };

  const options: SupabaseClientOptions<'public'> = {
    ...defaultOptions,
    ...customOptions,
    auth: {
      ...defaultOptions.auth,
      ...(customOptions?.auth || {})
    }
  };

  return createClient<Database>(url, anonKey, options);
};

/**
 * Returns a cached singleton Supabase client for browser usage.
 */
export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (!browserClientInstance) {
    browserClientInstance = createBrowserSupabaseClient();
  }
  return browserClientInstance;
};

/**
 * Server-only Supabase Client Factory
 * 
 * SECURITY GUARANTEES:
 * - Throws error if attempted to be instantiated inside browser window with sensitive service keys
 * - Does not store sessions in browser localStorage (stateless / server context)
 * - Safe for API routes, background jobs, or server-rendered actions
 */
export const createServerSupabaseClient = (
  serviceRoleKey?: string,
  customOptions?: SupabaseClientOptions<'public'>
): SupabaseClient<Database> => {
  // Hard security check: never allow service role key in the browser DOM/window
  if (typeof window !== 'undefined' && serviceRoleKey) {
    throw new Error('SECURITY VIOLATION: Service role keys must never be used in client/browser context.');
  }

  const { url, anonKey } = getSupabaseConfig();
  const apiKey = serviceRoleKey || anonKey;

  if (!url || !apiKey) {
    throw new Error('Supabase URL or API Key is missing. Ensure environment variables are configured.');
  }

  const serverOptions: SupabaseClientOptions<'public'> = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'x-application-name': 'vybe-server'
      }
    },
    ...customOptions
  };

  return createClient<Database>(url, apiKey, serverOptions);
};

/**
 * Primary export instance for frontend usage
 */
export const supabase = getSupabaseClient();
