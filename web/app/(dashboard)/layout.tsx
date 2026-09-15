import { AppShell } from '@/components/app-shell';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();
  return (
    <AppShell
      user={{
        name: session.user.name ?? 'Administrador',
        email: session.user.email ?? '',
      }}
    >
      {children}
    </AppShell>
  );
}
