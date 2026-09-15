import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { MotorcycleForm } from '@/components/motorcycle-form';

export default function NewMotorcyclePage() {
  return (
    <div className="w-full space-y-6">
      <Link href="/estoque" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-primary"><ChevronLeft className="size-4" />Voltar para o estoque</Link>
      <div><p className="section-kicker mb-2">Novo cadastro</p><h1 className="text-3xl font-semibold text-slate-950">Cadastrar moto</h1><p className="mt-2 text-sm text-slate-500">Preencha os dados do veículo e associe a referência FIPE.</p></div>
      <MotorcycleForm mode="create" />
    </div>
  );
}
