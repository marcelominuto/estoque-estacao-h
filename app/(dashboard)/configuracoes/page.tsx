import Link from 'next/link';
import { ChevronLeft, KeyRound, Settings2 } from 'lucide-react';

import { AccountSettingsForm, PasswordSettingsForm } from '@/components/account-settings-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AccountSettingsPage() {
  const session = await requireAdmin();
  const name = session.user.name ?? 'Administrador';
  const email = session.user.email ?? '';

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Link
        href="/estoque"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-[color] duration-150 hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Voltar para o estoque
      </Link>

      <div>
        <p className="section-kicker mb-2">Conta</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Configurações da conta</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">Atualize os dados usados para acessar o estoque.</p>
      </div>

      <Card className="rounded-lg bg-white">
        <CardHeader className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-8 items-center justify-center rounded-md bg-red-50 text-primary">
              <Settings2 className="size-4" strokeWidth={1.75} />
            </span>
            Dados de acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <AccountSettingsForm initialName={name} initialEmail={email} />
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-white">
        <CardHeader className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <span className="flex size-8 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              <KeyRound className="size-4" strokeWidth={1.75} />
            </span>
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <PasswordSettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
