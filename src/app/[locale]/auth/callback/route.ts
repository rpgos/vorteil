import { type NextRequest, NextResponse } from 'next/server';
import { setSession } from '@/server/auth/session';

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const provider = request.nextUrl.searchParams.get('provider') ?? 'magic-link';

  console.log(`[DB STUB] Would create/lookup user via ${provider}`);

  // Stub: always treat as a new registration-incomplete user.
  // Real implementation: exchange token with Supabase, look up or create User row.
  await setSession({
    userId: 'stub-user-1',
    email: 'stub@example.com',
    registrationComplete: false,
  });

  return NextResponse.redirect(new URL(`/${locale}/register`, request.url));
}
