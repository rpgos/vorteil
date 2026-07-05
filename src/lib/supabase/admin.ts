import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client that bypasses Row Level Security.
 * Only use server-side for admin operations (e.g. account deletion).
 * Never expose the service role key to the browser.
 */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
