import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';

import { DashboardCommercial } from '@/components/dashboard-commercial';
import { StockInsights } from '@/components/stock-insights';
import { StockMetrics } from '@/components/stock-metrics';
import { Button } from '@/components/ui/button';
import { listMotorcycles } from '@/lib/motorcycles';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const motorcycles = await listMotorcycles();

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker mb-2">Dashboard</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Visão comercial do estoque</h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">Acompanhe capital, margem e oportunidades de venda em um só lugar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/estoque" />}
            variant="outline"
            className="h-10 rounded-md px-4 text-xs font-semibold"
          >
            Ver estoque
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/motos/nova" />}
            className="h-10 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            Cadastrar moto
          </Button>
        </div>
      </div>

      <StockMetrics motorcycles={motorcycles} />
      <DashboardCommercial motorcycles={motorcycles} />
      <StockInsights motorcycles={motorcycles} />
    </div>
  );
}
