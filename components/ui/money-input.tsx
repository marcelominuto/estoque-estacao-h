'use client';

import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type MoneyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'type' | 'defaultValue' | 'value' | 'name'
> & {
  name: string;
  defaultValue?: string;
};

function parseInitialCents(value?: string) {
  const text = value?.trim();
  if (!text) return null;

  const cleaned = text.replace(/[^\d,.-]/g, '');
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

function formatCents(cents: number | null) {
  if (cents === null) return '';

  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function MoneyInput({
  className,
  name,
  defaultValue,
  onChange,
  ...props
}: MoneyInputProps) {
  const [cents, setCents] = React.useState<number | null>(() =>
    parseInitialCents(defaultValue),
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, '');
    const nextCents = digits ? Number(digits) : null;

    if (nextCents !== null && !Number.isSafeInteger(nextCents)) return;

    setCents(nextCents);
    onChange?.(event);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 select-none text-sm font-semibold leading-none text-slate-400">
        R$
      </span>
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={formatCents(cents)}
        onChange={handleChange}
        className={cn('field-control !pl-12 tabular-nums', className)}
      />
      <input
        type="hidden"
        name={name}
        value={cents === null ? '' : (cents / 100).toFixed(2)}
        readOnly
      />
    </div>
  );
}
