import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { MotorcycleForm } from '@/components/motorcycle-form';
import { findMotorcycle } from '@/lib/motorcycles';
import { motorcycleToFormValues } from '@/lib/inventory';

export const dynamic = 'force-dynamic';

export default async function EditMotorcyclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const motorcycle = await findMotorcycle(id);
  if (!motorcycle) notFound();

  return (
    <div className="w-full space-y-6">
      <Link href="/estoque" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-primary"><ChevronLeft className="size-4" />Voltar para o estoque</Link>
      <div><p className="section-kicker mb-2">Editar cadastro</p><h1 className="text-3xl font-semibold text-slate-950">{motorcycle.make} {motorcycle.model}</h1><p className="mt-2 text-sm text-slate-500">Atualize os dados do veículo ou sua referência FIPE.</p></div>
      <MotorcycleForm mode="edit" initialValues={motorcycleToFormValues(motorcycle)} />
    </div>
  );
}
