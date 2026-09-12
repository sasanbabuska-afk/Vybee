import { User as SupabaseAuthUser, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

export interface AuthState {
  user: User | null;
  supabaseUser: SupabaseAuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isSupabaseLive: boolean;
}

export const authService = {
  isLive(): boolean {
    return isSupabaseConfigured();
  },

  async getSession(): Promise<Session | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.auth.getSession();
      if (error) {
        console.warn('Supabase getSession error:', error.message);
        return null;
      }
      return data.session;
    } catch (err) {
      console.warn('Error fetching Supabase session:', err);
      return null;
    }
  },

  async getCurrentUser(): Promise<SupabaseAuthUser | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.auth.getUser();
      if (error) return null;
      return data.user;
    } catch {
      return null;
    }
  },

  async signUp(email: string, password: string, displayName: string): Promise<{ user: SupabaseAuthUser | null; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { user: null, error: new Error('Supabase is not configured. Please set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            name: displayName
          }
        }
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (err: any) {
      return { user: null, error: err };
    }
  },

  async signIn(email: string, password: string): Promise<{ user: SupabaseAuthUser | null; error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { user: null, error: new Error('Supabase is not configured.') };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (err: any) {
      return { user: null, error: err };
    }
  },

  async signInWithGoogle(): Promise<{ error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  },

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    const client = getSupabaseClient();
    if (!client) return { error: null };

    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const client = getSupabaseClient();
    if (!client) {
      return { unsubscribe: () => {} };
    }

    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return {
      unsubscribe: () => {
        authListener.subscription.unsubscribe();
      }
    };
  }
};
