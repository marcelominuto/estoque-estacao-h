import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InventoryTable } from '@/components/inventory-table';
import { RefreshAllFipeButton } from '@/components/refresh-all-fipe-button';
import { StockMetrics } from '@/components/stock-metrics';
import { listMotorcycles } from '@/lib/motorcycles';

export const dynamic = 'force-dynamic';

export default async function StockPage() {
  const motorcycles = await listMotorcycles();

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker mb-2">Estoque</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Motos em estoque</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Consulte e atualize os veículos cadastrados na loja.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RefreshAllFipeButton
            targets={motorcycles.flatMap((motorcycle) => (
              motorcycle.fipeModelId && motorcycle.fipeFuelId
                ? [{
                  id: motorcycle.id,
                  fipeModelId: motorcycle.fipeModelId,
                  fipeFuelId: motorcycle.fipeFuelId,
                  modelYear: motorcycle.modelYear,
                }]
                : []
            ))}
          />
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
      <InventoryTable motorcycles={motorcycles} />
    </div>
  );
}
