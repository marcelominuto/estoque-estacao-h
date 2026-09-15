'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import type { FipeVehicleOption } from '@/lib/fipe';

type FipeComboboxProps = {
  initial?: FipeVehicleOption | null;
  onSelect: (value: FipeVehicleOption | null) => void;
};

export function FipeCombobox({ initial = null, onSelect }: FipeComboboxProps) {
  const [query, setQuery] = useState(initial?.modelName ?? '');
  const [selected, setSelected] = useState<FipeVehicleOption | null>(initial);
  const [options, setOptions] = useState<FipeVehicleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const selecting = useRef(false);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2 || normalizedQuery === selected?.modelName) {
      startTransition(() => {
        setOptions([]);
        if (normalizedQuery.length === 0 || normalizedQuery === selected?.modelName) {
          setOpen(false);
        }
      });
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/fipe/search?q=${encodeURIComponent(normalizedQuery)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('FIPEX_REQUEST_FAILED');
        const payload = (await response.json()) as {
          data?: FipeVehicleOption[];
        };
        setOptions(payload.data ?? []);
        setOpen(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        toast.error('Não foi possível consultar a FIPE. Tente novamente.');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, selected?.modelName]);

  function handleSelect(value: string | null) {
    // Base UI emits null while the user is typing before an option is selected.
    // That event must not clear the controlled input value.
    if (!value) return;

    const next = options.find((option) => option.fipeCode === value);
    if (!next) return;

    selecting.current = true;
    setSelected(next);
    setQuery(next.modelName);
    onSelect(next);
    setOpen(false);
    window.setTimeout(() => {
      selecting.current = false;
    }, 0);
  }

  function handleInputValueChange(value: string) {
    if (selecting.current) return;

    setQuery(value);
    if (selected && value.trim() !== selected.modelName) {
      setSelected(null);
      onSelect(null);
    }
  }

  return (
    <div className="relative">
      <Combobox
        value={selected?.fipeCode ?? null}
        inputValue={query}
        // A FIPEX já filtrou os resultados; o valor dos itens é o código FIPE,
        // então o filtro local por texto esconderia modelos válidos.
        filter={() => true}
        onValueChange={handleSelect}
        open={open}
        onOpenChange={setOpen}
        onInputValueChange={handleInputValueChange}
      >
        <ComboboxInput
          id="fipe-search"
          aria-label="Pesquisar veículo na FIPE"
          placeholder="Ex.: CB 500, Fazer 250..."
          showTrigger={false}
          className="field-control pr-10"
        >
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          </span>
        </ComboboxInput>
        <ComboboxContent className="w-[min(100%,520px)] rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-950/10">
          <ComboboxList>
            {options.map((option) => (
              <ComboboxItem key={`${option.priceId}-${option.modelYear}`} value={option.fipeCode} className="rounded-lg px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="truncate font-medium">{option.makeName} {option.modelName}</span>
                    <span className="shrink-0 text-xs font-semibold text-[#2e8a88]">
                      {option.modelYear ?? '0 km'}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span>{option.fuelName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{option.fipeCode}</span>
                  </div>
                </div>
              </ComboboxItem>
            ))}
            <ComboboxEmpty>Nenhum veículo encontrado.</ComboboxEmpty>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {selected && (
        <p className="mt-2 text-xs text-slate-500">
          Selecionado: <strong className="font-semibold text-slate-700">{selected.modelName}</strong> · {selected.referenceMonth.toString().padStart(2, '0')}/{selected.referenceYear} · {selected.priceCents ? `R$ ${(selected.priceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Preço indisponível'}
        </p>
      )}
    </div>
  );
}
