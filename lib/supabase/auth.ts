import { createClient as createBrowserClient } from './client';
import { createClient as createServerClient } from './server';
import type { Database } from './types';

/**
 * PhiloVibe Auth Helpers
 * 
 * Client-side (use in forms, buttons, "use client" components)
 */
export async function signInWithPassword(email: string, password: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // e.g. { full_name: '...' }
    },
  });
  return { data, error };
}

export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function signInWithMagicLink(email: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

/**
 * Server-side helpers (use in Server Components, Route Handlers, Server Actions)
 */
export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

export async function getSession() {
  const supabase = await createServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error };
}

/**
 * Example protected data fetch helper (uncomment when you add a `profiles` table)
 */
// export async function getCurrentUserProfile() {
//   const { user } = await getUser();
//   if (!user) return { profile: null, error: new Error('Not authenticated') };
//
//   const supabase = await createServerClient();
//   const { data, error } = await supabase
//     .from('profiles')
//     .select('*')
//     .eq('id', user.id)
//     .single();
//
//   return { profile: data, error };
// }

