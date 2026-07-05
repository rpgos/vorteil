import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const code = request.nextUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('error', 'auth');
      return NextResponse.redirect(loginUrl);
    }

    if (user) {
      const { data: profile } = await supabase.from('users').select('id').eq('id', user.id).single();

      if (!profile) {
        return NextResponse.redirect(new URL(`/${locale}/register`, request.url));
      }
    }
  }

  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}
