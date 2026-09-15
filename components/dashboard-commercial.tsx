import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  Gauge,
  Tag,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MotorcycleListItem } from '@/lib/motorcycles';
import { formatCurrencyFromCents } from '@/lib/format';

type MetricTone = 'red' | 'green' | 'blue' | 'amber';

const metricStyles: Record<MetricTone, { icon: string; value: string }> = {
  red: {
    icon: 'bg-red-50 text-primary ring-1 ring-red-100',
    value: 'text-slate-950',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
    value: 'text-emerald-950',
  },
  blue: {
    icon: 'bg-sky-50 text-sky-600 ring-1 ring-sky-100',
    value: 'text-sky-950',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
    value: 'text-amber-950',
  },
};

function CommercialMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof CircleDollarSign;
  tone: MetricTone;
}) {
  const styles = metricStyles[tone];

  return (
    <div className="rounded-md border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-md ${styles.icon}`}>
          <Icon className="size-3.5" strokeWidth={2} />
        </span>
      </div>
      <p className={`mt-4 text-xl font-bold tracking-tight tabular-nums ${styles.value}`}>{value}</p>
      <p className="mt-1 text-[11px] font-medium leading-4 text-slate-400">{detail}</p>
    </div>
  );
}

function AttentionRow({
  icon: Icon,
  title,
  detail,
  tone,
}: {
  icon: typeof AlertTriangle;
  title: string;
  detail: string;
  tone: 'red' | 'amber' | 'slate';
}) {
  const tones = {
    red: 'bg-red-50 text-primary',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <li className="flex items-start gap-3 border-b border-slate-100 pb-3.5 last:border-0 last:pb-0">
      <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ${tones[tone]}`}>
        <Icon className="size-3.5" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-800">{title}</p>
        <p className="mt-0.5 text-[11px] font-medium leading-4 text-slate-400">{detail}</p>
      </div>
    </li>
  );
}

export function DashboardCommercial({ motorcycles }: { motorcycles: MotorcycleListItem[] }) {
  const active = motorcycles.filter((motorcycle) => motorcycle.status !== 'SOLD');
  const available = active.filter((motorcycle) => motorcycle.status === 'AVAILABLE').length;
  const reserved = active.filter((motorcycle) => motorcycle.status === 'RESERVED').length;
  const totalCostCents = active.reduce((sum, motorcycle) => sum + (motorcycle.totalCostCents ?? 0), 0);
  const potentialSaleCents = active.reduce((sum, motorcycle) => sum + (motorcycle.salePriceCents ?? 0), 0);
  const potentialMarginCents = potentialSaleCents - totalCostCents;
  const marginPercent = totalCostCents > 0 ? Math.round((potentialMarginCents / totalCostCents) * 100) : 0;
  const withFipe = active.filter((motorcycle) => motorcycle.fipePriceCents !== null).length;
  const belowFipe = active.filter((motorcycle) => (
    motorcycle.salePriceCents !== null
    && motorcycle.fipePriceCents !== null
    && motorcycle.salePriceCents < motorcycle.fipePriceCents
  )).length;
  const aging = active.filter((motorcycle) => motorcycle.daysInStock > 90).length;
  const availableShare = active.length > 0 ? (available / active.length) * 100 : 0;
  const reservedShare = active.length > 0 ? (reserved / active.length) * 100 : 0;

  return (
    <section aria-label="Leitura comercial do estoque" className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <Card className="rounded-lg bg-white shadow-[var(--shadow-surface)]">
        <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold tracking-tight text-slate-950">Leitura comercial</CardTitle>
              <p className="mt-1 text-xs font-medium text-slate-400">Oportunidades e capital do pátio atual</p>
            </div>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-red-50 text-primary">
              <TrendingUp className="size-4" strokeWidth={1.9} />
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <CommercialMetric
              label="Venda projetada"
              value={formatCurrencyFromCents(potentialSaleCents)}
              detail="soma dos preços de venda"
              icon={Tag}
              tone="red"
            />
            <CommercialMetric
              label="Margem potencial"
              value={`${formatCurrencyFromCents(potentialMarginCents)} · ${marginPercent}%`}
              detail="venda projetada − custo total"
              icon={TrendingUp}
              tone={potentialMarginCents >= 0 ? 'green' : 'amber'}
            />
            <CommercialMetric
              label="Capital imobilizado"
              value={formatCurrencyFromCents(totalCostCents)}
              detail={`${active.length} ${active.length === 1 ? 'moto ativa' : 'motos ativas'}`}
              icon={CircleDollarSign}
              tone="blue"
            />
            <CommercialMetric
              label="Cobertura FIPE"
              value={`${withFipe}/${active.length}`}
              detail={active.length ? `${Math.round((withFipe / active.length) * 100)}% do pátio ativo` : 'sem motos ativas'}
              icon={Gauge}
              tone="amber"
            />
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-slate-700">Composição do pátio</p>
              <p className="text-[11px] font-medium text-slate-400">{active.length} ativas</p>
            </div>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              {available > 0 && <div className="bg-emerald-500" style={{ width: `${availableShare}%` }} />}
              {reserved > 0 && <div className="bg-amber-400" style={{ width: `${reservedShare}%` }} />}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" />{available} disponíveis</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-400" />{reserved} reservadas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-white shadow-[var(--shadow-surface)]">
        <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold tracking-tight text-slate-950">Ações comerciais</CardTitle>
              <p className="mt-1 text-xs font-medium text-slate-400">Pontos que merecem atenção agora</p>
            </div>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
              <AlertTriangle className="size-4" strokeWidth={1.9} />
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <ul className="space-y-3.5">
            <AttentionRow
              icon={Clock3}
              tone={aging > 0 ? 'red' : 'slate'}
              title={aging > 0 ? `${aging} ${aging === 1 ? 'moto está' : 'motos estão'} há mais de 90 dias` : 'Nenhuma moto acima de 90 dias'}
              detail={aging > 0 ? 'Priorize a negociação para reduzir custo de pátio.' : 'O tempo de permanência está dentro do esperado.'}
            />
            <AttentionRow
              icon={TrendingDown}
              tone={belowFipe > 0 ? 'amber' : 'slate'}
              title={belowFipe > 0 ? `${belowFipe} ${belowFipe === 1 ? 'preço está' : 'preços estão'} abaixo da FIPE` : 'Preços alinhados à FIPE'}
              detail={belowFipe > 0 ? 'Revise o preço de venda antes de anunciar.' : 'Nenhuma moto ativa está abaixo da referência salva.'}
            />
            <AttentionRow
              icon={CircleDollarSign}
              tone={withFipe < active.length ? 'amber' : 'slate'}
              title={withFipe < active.length ? `${active.length - withFipe} ${active.length - withFipe === 1 ? 'moto sem' : 'motos sem'} referência FIPE` : 'FIPE preenchida em todo o pátio'}
              detail={withFipe < active.length ? 'Complete a referência para melhorar a comparação comercial.' : 'Todos os veículos ativos possuem uma referência salva.'}
            />
          </ul>

          <Button
            nativeButton={false}
            render={<Link href="/estoque" />}
            variant="outline"
            className="mt-6 h-9 w-full rounded-md text-xs font-semibold"
          >
            Abrir estoque
            <ArrowUpRight className="size-3.5" strokeWidth={2} />
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
