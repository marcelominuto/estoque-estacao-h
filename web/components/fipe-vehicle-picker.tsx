'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { AppCombobox } from '@/components/ui/app-combobox';
import { AppSelect } from '@/components/ui/app-select';
import type {
  FipeMakeOption,
  FipeModelOption,
  FipeVehicleOption,
  FipeYearOption,
} from '@/lib/fipe';

type FipeVehiclePickerProps = {
  initial?: FipeVehicleOption | null;
  onSelect: (value: FipeVehicleOption | null) => void;
};

async function requestCatalog<T>(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  const payload = (await response.json()) as { data?: T; message?: string };
  if (!response.ok || payload.data === undefined) {
    throw new Error(payload.message ?? 'Não foi possível consultar a FIPE.');
  }
  return payload.data;
}

function yearKey(option: FipeYearOption) {
  return `${option.value ?? 'zero'}:${option.fuelId}`;
}

function formatFipePrice(priceCents: number | null) {
  if (priceCents === null) return 'Preço indisponível';
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function catalogLabel(value: string) {
  return value.trim().toLocaleUpperCase('pt-BR');
}

function catalogSearchTokens(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .match(/[a-z]+|\d+/g) ?? [];
}

function matchesCatalogQuery(value: string, query: string) {
  const tokens = catalogSearchTokens(query);
  if (tokens.length === 0) return true;

  const searchableValue = catalogSearchTokens(value).join(' ');
  return tokens.every((token) => searchableValue.includes(token));
}

export function FipeVehiclePicker({
  initial = null,
  onSelect,
}: FipeVehiclePickerProps) {
  const [makes, setMakes] = useState<FipeMakeOption[]>([]);
  const [models, setModels] = useState<FipeModelOption[]>([]);
  const [years, setYears] = useState<FipeYearOption[]>([]);
  const [makeId, setMakeId] = useState(initial?.makeId ?? '');
  const [makeQuery, setMakeQuery] = useState(catalogLabel(initial?.makeName ?? ''));
  const [modelId, setModelId] = useState(initial?.modelId ?? '');
  const [modelQuery, setModelQuery] = useState(catalogLabel(initial?.modelName ?? ''));
  const [yearValue, setYearValue] = useState(
    initial ? yearKey({
      value: initial.modelYear,
      label: initial.modelYear === null ? '0 km' : String(initial.modelYear),
      isZeroKm: initial.modelYear === null,
      fuelId: initial.fuelId,
      fuelAcronym: '',
      fuelName: initial.fuelName,
    }) : '',
  );
  const [selected, setSelected] = useState<FipeVehicleOption | null>(initial);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const priceAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    requestCatalog<FipeMakeOption[]>('/api/fipe/catalog?kind=makes', controller.signal)
      .then(setMakes)
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError('Não foi possível carregar as marcas FIPE.');
        toast.error('Não foi possível carregar as marcas FIPE.');
      })
      .finally(() => setLoadingMakes(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!makeId) {
      return;
    }

    const controller = new AbortController();
    async function loadModels() {
      setLoadingModels(true);
      try {
        setModels(await requestCatalog<FipeModelOption[]>(
          `/api/fipe/catalog?kind=models&makeId=${encodeURIComponent(makeId)}`,
          controller.signal,
        ));
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError('Não foi possível carregar os modelos dessa marca.');
        toast.error('Não foi possível carregar os modelos FIPE.');
      } finally {
        setLoadingModels(false);
      }
    }
    void loadModels();

    return () => controller.abort();
  }, [makeId]);

  useEffect(() => {
    if (!modelId) {
      return;
    }

    const controller = new AbortController();
    async function loadYears() {
      setLoadingYears(true);
      try {
        setYears(await requestCatalog<FipeYearOption[]>(
          `/api/fipe/catalog?kind=years&modelId=${encodeURIComponent(modelId)}`,
          controller.signal,
        ));
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError('Não foi possível carregar os anos desse modelo.');
        toast.error('Não foi possível carregar os anos FIPE.');
      } finally {
        setLoadingYears(false);
      }
    }
    void loadYears();

    return () => controller.abort();
  }, [modelId]);

  const sortedMakes = useMemo(
    () => [...makes].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [makes],
  );
  const filteredMakes = useMemo(() => {
    if (!makeQuery.trim()) return sortedMakes;
    return sortedMakes.filter((make) => matchesCatalogQuery(make.name, makeQuery));
  }, [makeQuery, sortedMakes]);
  const modelLabels = useMemo(() => {
    const counts = new Map<string, number>();
    for (const model of models) {
      counts.set(model.name, (counts.get(model.name) ?? 0) + 1);
    }
    return models.map((model) => ({
      ...model,
      label: counts.get(model.name) === 1 ? model.name : `${model.name} (${model.slug})`,
    }));
  }, [models]);

  const filteredModels = useMemo(() => {
    if (!modelQuery.trim()) return modelLabels;
    return modelLabels.filter((model) => matchesCatalogQuery(model.label, modelQuery));
  }, [modelLabels, modelQuery]);

  const yearOptions = years.map((year) => ({
    value: yearKey(year),
    label: `${year.label} · ${year.fuelName}`,
  }));

  function clearPriceSelection() {
    priceAbort.current?.abort();
    setLoadingPrice(false);
    setSelected(null);
    onSelect(null);
  }

  function handleMakeChange(value: string) {
    setMakeId(value);
    setMakeQuery(value ? catalogLabel(sortedMakes.find((make) => make.id === value)?.name ?? '') : '');
    setModelId('');
    setModelQuery('');
    setYearValue('');
    setModels([]);
    setYears([]);
    setError(null);
    clearPriceSelection();
  }

  function handleModelChange(value: string) {
    setModelId(value);
    setModelQuery(value ? catalogLabel(modelLabels.find((model) => model.id === value)?.label ?? '') : '');
    setYearValue('');
    setYears([]);
    setError(null);
    clearPriceSelection();
  }

  async function handleYearChange(value: string) {
    setYearValue(value);
    setError(null);
    clearPriceSelection();

    const choice = years.find((option) => yearKey(option) === value);
    if (!choice || !modelId) return;

    const controller = new AbortController();
    priceAbort.current?.abort();
    priceAbort.current = controller;
    setLoadingPrice(true);

    try {
      const params = new URLSearchParams({
        kind: 'price',
        modelId,
        fuelId: choice.fuelId,
        year: choice.isZeroKm ? 'zero' : String(choice.value),
      });
      const vehicle = await requestCatalog<FipeVehicleOption>(
        `/api/fipe/catalog?${params.toString()}`,
        controller.signal,
      );
      setSelected(vehicle);
      onSelect(vehicle);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return;
      setError('Não foi possível carregar o preço FIPE desse ano.');
      toast.error('Não foi possível carregar o preço FIPE desse ano.');
    } finally {
      setLoadingPrice(false);
    }
  }

  return (
    <div className="space-y-4" aria-busy={loadingMakes || loadingModels || loadingYears || loadingPrice}>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="fipe-make" className="field-label">1. Marca FIPE</label>
          <AppCombobox
            id="fipe-make"
            value={makeId}
            inputValue={makeQuery}
            onInputValueChange={(value) => {
              setMakeQuery(value);
              const currentLabel = catalogLabel(sortedMakes.find((make) => make.id === makeId)?.name ?? '');
              if (makeId && value.trim().toLocaleUpperCase('pt-BR') !== currentLabel) {
                setMakeId('');
                setModelId('');
                setModelQuery('');
                setYearValue('');
                setModels([]);
                setYears([]);
                setError(null);
                clearPriceSelection();
              }
            }}
            onValueChange={handleMakeChange}
            disabled={loadingMakes}
            placeholder={loadingMakes ? 'Carregando marcas...' : 'Pesquise e selecione a marca'}
            options={filteredMakes.map((make) => ({ value: make.id, label: catalogLabel(make.name) }))}
          />
        </div>

        <div>
          <label htmlFor="fipe-model" className="field-label">2. Modelo FIPE</label>
          <AppCombobox
            id="fipe-model"
            value={modelId}
            inputValue={modelQuery}
            onInputValueChange={(value) => {
              setModelQuery(value);
              const currentLabel = catalogLabel(modelLabels.find((model) => model.id === modelId)?.label ?? '');
              if (modelId && value.trim().toLocaleUpperCase('pt-BR') !== currentLabel) {
                setModelId('');
                setYearValue('');
                setYears([]);
                setError(null);
                clearPriceSelection();
              }
            }}
            onValueChange={handleModelChange}
            disabled={!makeId || loadingModels}
            placeholder={loadingModels ? 'Carregando modelos...' : 'Pesquise e selecione o modelo'}
            options={filteredModels.map((model) => ({ value: model.id, label: catalogLabel(model.label) }))}
          />
        </div>

        <div>
          <label htmlFor="fipe-year" className="field-label">3. Ano/modelo FIPE</label>
          <AppSelect
            id="fipe-year"
            value={yearValue}
            onValueChange={(value) => void handleYearChange(value)}
            disabled={!modelId || loadingYears || loadingPrice}
            placeholder={loadingYears ? 'Carregando anos...' : 'Selecione o ano/modelo'}
            options={yearOptions}
          />
        </div>
      </div>

      {loadingPrice && (
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="size-3.5 animate-spin" /> Consultando preço FIPE...
        </p>
      )}

      {selected && (
        <output aria-live="polite" className="block rounded-xl border border-red-100 bg-red-50/70 px-4 py-3 text-sm text-slate-600">
          FIPE associada: <strong className="text-slate-900">{selected.makeName} {selected.modelName}</strong> · {selected.modelYear ?? '0 km'} · {selected.fuelName} · <strong className="text-primary">{formatFipePrice(selected.priceCents)}</strong>
          <span className="mt-1 block text-xs text-slate-500">Código {selected.fipeCode} · Referência {String(selected.referenceMonth).padStart(2, '0')}/{selected.referenceYear}</span>
        </output>
      )}

      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
