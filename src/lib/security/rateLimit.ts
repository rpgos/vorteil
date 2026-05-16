/**
 * Rate-limit helper. Currently a no-op stub — logs intent and calls through.
 * Replace with a real Redis/Supabase counter when the DB is wired up.
 */
export async function withRateLimit<T>(key: string, identifier: string, fn: () => Promise<T>): Promise<T> {
  console.log(`[RATE LIMIT] key=${key} identifier=${identifier}`);
  return fn();
}
