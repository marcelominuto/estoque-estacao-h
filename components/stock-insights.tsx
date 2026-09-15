import { BarChart3, Clock3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { MotorcycleListItem } from '@/lib/motorcycles';
import { formatCurrencyFromCents } from '@/lib/format';

export function StockInsights({ motorcycles }: { motorcycles: MotorcycleListItem[] }) {
  const stock = motorcycles.filter((moto) => moto.status !== 'SOLD');
  const brands = Array.from(new Set(stock.map((moto) => moto.make))).map((make) => {
    const vehicles = stock.filter((moto) => moto.make === make);
    return { make, count: vehicles.length, capital: vehicles.reduce((sum, moto) => sum + (moto.totalCostCents ?? 0), 0) };
  }).sort((a, b) => b.count - a.count).slice(0, 5);
  const largest = Math.max(1, ...brands.map((brand) => brand.count));
  const periods = [
    { label: 'Até 30 dias', count: stock.filter((moto) => moto.daysInStock <= 30).length, color: 'bg-emerald-500', dot: 'bg-emerald-500' },
    { label: '31–60 dias', count: stock.filter((moto) => moto.daysInStock > 30 && moto.daysInStock <= 60).length, color: 'bg-sky-500', dot: 'bg-sky-500' },
    { label: '61–90 dias', count: stock.filter((moto) => moto.daysInStock > 60 && moto.daysInStock <= 90).length, color: 'bg-amber-500', dot: 'bg-amber-500' },
    { label: 'Mais de 90 dias', count: stock.filter((moto) => moto.daysInStock > 90).length, color: 'bg-rose-500', dot: 'bg-rose-500' },
  ];
  const aging = periods[3].count;

  return (
    <section aria-label="Análise do estoque atual" className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <Card className="rounded-lg bg-white p-5 sm:p-6 shadow-[var(--shadow-surface)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <BarChart3 className="size-3.5" strokeWidth={2} />
            </span>
            <h2 className="text-sm font-bold tracking-tight text-slate-900">Estoque por marca</h2>
          </div>
          <span className="rounded-full bg-slate-100/90 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">Disponíveis e reservadas</span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">{stock.length}</span>
          <span className="text-xs font-medium text-slate-500">{stock.length === 1 ? 'moto ativa' : 'motos ativas'}</span>
        </div>
        {brands.length ? (
          <div className="mt-4 space-y-3.5">
            {brands.map((brand) => (
              <div key={brand.make} className="grid grid-cols-[85px_1fr_28px] items-center gap-3 text-xs sm:grid-cols-[95px_1fr_28px_110px]">
                <span className="truncate font-semibold text-slate-700" title={brand.make}>{brand.make}</span>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                    style={{ width: `${(brand.count / largest) * 100}%` }}
                  />
                </div>
                <span className="text-right font-bold text-slate-900 tabular-nums">{brand.count}</span>
                <span className="hidden text-right text-[11px] font-medium text-slate-500 tabular-nums sm:block">{formatCurrencyFromCents(brand.capital)}</span>
              </div>
            ))}
            <p className="pt-2 text-[11px] font-medium text-slate-400">Até 5 marcas com maior volume · valores de custo total</p>
          </div>
        ) : (
          <p className="py-8 text-xs font-medium text-slate-400">Cadastre uma moto para acompanhar a distribuição por marca.</p>
        )}
      </Card>

      <Card className="rounded-lg bg-white p-5 sm:p-6 shadow-[var(--shadow-surface)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <Clock3 className="size-3.5" strokeWidth={2} />
            </span>
            <h2 className="text-sm font-bold tracking-tight text-slate-900">Tempo em estoque</h2>
          </div>
          {aging > 0 && (
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200/50">
              Atenção
            </span>
          )}
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">{aging}</span>
          <span className="text-xs font-medium text-slate-500">{aging === 1 ? 'moto há mais de 90 dias' : 'motos há mais de 90 dias'}</span>
        </div>
        <div className="my-4 flex h-3 gap-1 overflow-hidden rounded-full bg-slate-100 p-0.5" aria-hidden="true">
          {periods.filter((period) => period.count > 0).map((period) => (
            <div
              key={period.label}
              className={`rounded-full ${period.color} transition-all duration-300`}
              style={{ width: `${(period.count / (stock.length || 1)) * 100}%` }}
              title={`${period.label}: ${period.count}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1">
          {periods.map((period) => (
            <div key={period.label} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span className={`size-2 rounded-full ${period.dot}`} />
                {period.label}
              </span>
              <span className="font-bold text-slate-900 tabular-nums">{period.count}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] font-medium leading-relaxed text-slate-400">
          {stock.length ? 'Acompanhe o tempo de permanência para priorizar negociações e reduzir custos de pátio.' : 'Sem motos ativas para análise.'}
        </p>
      </Card>
    </section>
  );
}
