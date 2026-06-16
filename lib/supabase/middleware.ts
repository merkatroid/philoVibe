import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from './types';

/**
 * Supabase middleware helper.
 * 
 * Use this in `middleware.ts` at the project root to:
 * - Refresh expired auth sessions
 * - Protect routes (e.g. /settings, future /profile)
 * 
 * Example usage in middleware.ts:
 * 
 * import { updateSession } from '@/lib/supabase/middleware';
 * 
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request);
 * }
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: This refreshes the session if expired
  await supabase.auth.getUser();

  return supabaseResponse;
}
