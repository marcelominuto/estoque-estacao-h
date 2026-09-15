'use client';

import Link from 'next/link';
import { ArrowDownUp, ChevronDown, ChevronUp, Pencil, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AppEmptyState } from '@/components/app-empty-state';
import { DeleteMotorcycleDialog } from '@/components/delete-motorcycle-dialog';
import { RefreshFipeButton } from '@/components/refresh-fipe-button';
import { MotorcycleDetailsDrawer } from '@/components/motorcycle-details-drawer';
import { StatusForm } from '@/components/status-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AppSelect } from '@/components/ui/app-select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { MotorcycleListItem } from '@/lib/motorcycles';
import { MOTORCYCLE_STATUS_LABELS, type MotorcycleStatus } from '@/lib/constants/motorcycle';
import { formatCurrencyFromCents } from '@/lib/format';

type InventoryMotorcycle = Pick<
  MotorcycleListItem,
  | 'id'
  | 'make'
  | 'model'
  | 'color'
  | 'mileage'
  | 'plate'
  | 'modelYear'
  | 'daysInStock'
  | 'purchasePriceCents'
  | 'costsCents'
  | 'totalCostCents'
  | 'salePriceCents'
  | 'fipePriceCents'
  | 'fipeModelId'
  | 'fipeFuelId'
  | 'status'
>;

type SortKey =
  | 'vehicle'
  | 'plate'
  | 'modelYear'
  | 'daysInStock'
  | 'purchasePriceCents'
  | 'costsCents'
  | 'totalCostCents'
  | 'salePriceCents'
  | 'fipePriceCents'
  | 'status';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'ALL' | MotorcycleStatus;

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ArrowDownUp className="size-3.5 text-slate-300" />;
  return direction === 'asc'
    ? <ChevronUp className="size-3.5 text-primary" />
    : <ChevronDown className="size-3.5 text-primary" />;
}

export function InventoryTable({ motorcycles }: { motorcycles: InventoryMotorcycle[] }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('daysInStock');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const visibleMotorcycles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
    const filtered = motorcycles.filter((motorcycle) => {
      const matchesStatus = statusFilter === 'ALL' || motorcycle.status === statusFilter;
      if (!matchesStatus) return false;
      if (!normalizedQuery) return true;

      return [motorcycle.make, motorcycle.model, motorcycle.plate, motorcycle.color]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedQuery);
    });

    return filtered.sort((a, b) => {
      const aValue = sortValue(a, sortKey);
      const bValue = sortValue(b, sortKey);
      const result = typeof aValue === 'number' && typeof bValue === 'number'
        ? aValue - bValue
        : collator.compare(String(aValue), String(bValue));

      return sortDirection === 'asc' ? result : -result;
    });
  }, [motorcycles, query, sortDirection, sortKey, statusFilter]);

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc');
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === 'daysInStock' || nextKey === 'purchasePriceCents' || nextKey === 'costsCents' || nextKey === 'totalCostCents' || nextKey === 'salePriceCents' || nextKey === 'fipePriceCents' ? 'desc' : 'asc');
  }

  const isFiltering = query.trim().length > 0 || statusFilter !== 'ALL';

  return (
    <TooltipProvider delay={250}>
      <Card className="overflow-visible py-0 rounded-lg bg-white shadow-[var(--shadow-surface)]">
        <CardContent className="p-0">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-slate-950">Veículos cadastrados</h2>
              {isFiltering && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setStatusFilter('ALL'); }}
                  className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-primary transition-[background-color] duration-150 hover:bg-red-100"
                >
                  Limpar busca
                </button>
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {isFiltering
                ? `${visibleMotorcycles.length} de ${motorcycles.length} veículos exibidos`
                : motorcycles.length === 1 ? '1 veículo no pátio' : `${motorcycles.length} veículos no pátio`}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:flex-row lg:w-auto">
            <div className="relative min-w-0 flex-1 sm:min-w-[280px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar moto, cor ou placa..."
                aria-label="Buscar moto ou placa"
                className="field-control !h-10 !pl-10 !rounded-md text-xs sm:text-sm"
              />
            </div>
            <AppSelect
              id="stock-status-filter"
              value={statusFilter}
              onValueChange={(value) => setStatusFilter((value || 'ALL') as StatusFilter)}
              placeholder="Todos os status"
              size="toolbar"
              className="!h-10 w-full sm:w-[170px] !rounded-md"
              options={[
                { value: 'ALL', label: 'Todos os status' },
                { value: 'AVAILABLE', label: 'Disponíveis' },
                { value: 'RESERVED', label: 'Reservadas' },
                { value: 'SOLD', label: 'Vendidas' },
              ]}
            />
          </div>
        </div>

        {motorcycles.length === 0 ? (
          <AppEmptyState />
        ) : visibleMotorcycles.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-950">Nenhuma moto encontrada</h3>
            <p className="mt-1 text-xs text-slate-500">Tente ajustar a busca ou o filtro de status selecionado.</p>
          </div>
        ) : (
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Allow keyboard scrolling of the wide table.
          <section aria-label="Motos em estoque, tabela com rolagem horizontal" tabIndex={0} className="inventory-scroll overflow-x-auto rounded-b-lg">
              <table className="w-full min-w-[1340px] text-left text-[13px] tabular-nums">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.02em] text-slate-500">
                <tr>
                  <SortableHeader label="Veículo" sortKey="vehicle" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} className="px-5" />
                  <SortableHeader label="Placa" sortKey="plate" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Ano" sortKey="modelYear" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Dias estoque" sortKey="daysInStock" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Valor pago" sortKey="purchasePriceCents" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Custos extras" sortKey="costsCents" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Custo total" sortKey="totalCostCents" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Preço venda" sortKey="salePriceCents" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Preço FIPE" sortKey="fipePriceCents" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <SortableHeader label="Status" sortKey="status" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <th className="px-5 py-3.5 text-right font-bold text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleMotorcycles.map((motorcycle) => {
                  const status = motorcycle.status as MotorcycleStatus;
                  const vehicleLabel = `${motorcycle.make} ${motorcycle.model}`;

                  return (
                    <tr key={motorcycle.id} className="group/row bg-white transition-colors duration-150 hover:bg-slate-50/80">
                      <td className="sticky left-0 z-10 min-w-56 max-w-72 bg-white px-5 py-3.5 transition-colors group-hover/row:bg-slate-50/95">
                        <div className="font-bold text-slate-900">{vehicleLabel}</div>
                        <div className="mt-0.5 text-xs font-medium text-slate-400">{motorcycle.color} · {motorcycle.mileage.toLocaleString('pt-BR')} km</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 ring-1 ring-slate-200/70">
                          {motorcycle.plate}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-600">{motorcycle.modelYear}</td>
                      <td className="px-4 py-3.5">
                        <span className={`font-bold ${motorcycle.daysInStock > 90 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {motorcycle.daysInStock}
                        </span>{' '}
                        <span className="text-xs font-medium text-slate-400">dias</span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700">{formatCurrencyFromCents(motorcycle.purchasePriceCents)}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700">{formatCurrencyFromCents(motorcycle.costsCents)}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-950">{formatCurrencyFromCents(motorcycle.totalCostCents)}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-800">{formatCurrencyFromCents(motorcycle.salePriceCents)}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        <div className="font-bold text-slate-900">{formatCurrencyFromCents(motorcycle.fipePriceCents)}</div>
                      </td>
                      <td className="px-4 py-3.5"><StatusForm id={motorcycle.id} status={status} /></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <RefreshFipeButton
                            id={motorcycle.id}
                            vehicleLabel={vehicleLabel}
                            disabled={!motorcycle.fipeModelId || !motorcycle.fipeFuelId}
                          />
                          <MotorcycleDetailsDrawer id={motorcycle.id} vehicleLabel={vehicleLabel} />
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  nativeButton={false}
                                  render={<Link href={`/motos/${motorcycle.id}/editar`} />}
                                  variant="outline"
                                  size="icon"
                                  aria-label={`Editar ${vehicleLabel}`}
                                  className="size-8 rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-[border-color,background-color,color,transform] duration-150 hover:border-slate-400 hover:bg-slate-50/80 hover:text-slate-900 active:scale-95"
                                >
                                  <Pencil className="size-3.5" strokeWidth={1.75} />
                                </Button>
                              }
                            />
                            <TooltipContent>Editar moto</TooltipContent>
                          </Tooltip>
                          <DeleteMotorcycleDialog id={motorcycle.id} vehicleLabel={vehicleLabel} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function sortValue(motorcycle: InventoryMotorcycle, sortKey: SortKey) {
  switch (sortKey) {
    case 'vehicle':
      return `${motorcycle.make} ${motorcycle.model}`;
    case 'plate':
      return motorcycle.plate;
    case 'modelYear':
      return motorcycle.modelYear;
    case 'daysInStock':
      return motorcycle.daysInStock;
    case 'purchasePriceCents':
      return motorcycle.purchasePriceCents ?? -1;
    case 'costsCents':
      return motorcycle.costsCents ?? -1;
    case 'totalCostCents':
      return motorcycle.totalCostCents ?? -1;
    case 'salePriceCents':
      return motorcycle.salePriceCents ?? -1;
    case 'fipePriceCents':
      return motorcycle.fipePriceCents ?? -1;
    case 'status':
      return MOTORCYCLE_STATUS_LABELS[motorcycle.status as MotorcycleStatus];
  }
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (sortKey: SortKey) => void;
  className?: string;
}) {
  const active = activeKey === sortKey;

  return (
    <th className={`${className ?? 'px-4'} py-0`} aria-sort={active ? direction === 'asc' ? 'ascending' : 'descending' : 'none'}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="flex w-full items-center gap-1.5 py-3 text-left transition-colors hover:text-slate-700"
      >
        {label}
        <SortIcon active={active} direction={direction} />
      </button>
    </th>
  );
}
