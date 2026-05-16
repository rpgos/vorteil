import { requireSession } from '@/server/auth/guards';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <>{children}</>;
}
