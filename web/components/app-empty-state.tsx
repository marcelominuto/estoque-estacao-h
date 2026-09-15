import Link from 'next/link';
import { Bike, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function AppEmptyState() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-primary"><Bike className="size-7" /></div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">Seu estoque ainda está vazio</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Cadastre a primeira moto para começar a acompanhar os veículos da loja.</p>
      <Button nativeButton={false} render={<Link href="/motos/nova" />} className="mt-5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-red-900/15 hover:bg-primary/90"><Plus className="size-4" />Cadastrar primeira moto</Button>
    </div>
  );
}
