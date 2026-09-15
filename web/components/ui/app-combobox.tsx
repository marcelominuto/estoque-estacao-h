'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type AppComboboxOption = {
  value: string;
  label: string;
};

type AppComboboxProps = {
  id?: string;
  value?: string | null;
  inputValue: string;
  placeholder: string;
  options: AppComboboxOption[];
  disabled?: boolean;
  emptyMessage?: string;
  onInputValueChange: (value: string) => void;
  onValueChange: (value: string) => void;
};

export function AppCombobox({
  id,
  value,
  inputValue,
  placeholder,
  options,
  disabled,
  emptyMessage = 'Nenhum resultado encontrado.',
  onInputValueChange,
  onValueChange,
}: AppComboboxProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listboxId = `${id ?? 'combobox'}-listbox`;
  const [open, setOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  React.useEffect(() => {
    function closeWhenClickingOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', closeWhenClickingOutside);
    return () => document.removeEventListener('pointerdown', closeWhenClickingOutside);
  }, []);

  React.useEffect(() => {
    setHighlightedIndex((current) => Math.min(current, Math.max(options.length - 1, 0)));
  }, [options.length]);

  function selectOption(option: AppComboboxOption) {
    onValueChange(option.value);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((current) => Math.min(current + 1, Math.max(options.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter' && open && options[highlightedIndex]) {
      event.preventDefault();
      selectOption(options[highlightedIndex]);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <Input
        ref={inputRef}
        id={id}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={open && options[highlightedIndex] ? `${listboxId}-${options[highlightedIndex].value}` : undefined}
        className="field-control pr-10"
        onFocus={() => {
          if (!disabled) setOpen(true);
        }}
        onChange={(event) => {
          onInputValueChange(event.target.value);
          if (!disabled) {
            setOpen(true);
            setHighlightedIndex(0);
          }
        }}
        onKeyDown={handleKeyDown}
      />
      <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

      {open && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10"
        >
          {options.length > 0 ? options.map((option, index) => (
            <div
              id={`${listboxId}-${option.value}`}
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={cn(
                'cursor-pointer rounded-lg px-3 py-2.5 text-sm text-slate-700',
                index === highlightedIndex && 'bg-red-50 text-red-800',
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.label}
            </div>
          )) : (
            <p className="px-3 py-3 text-sm text-slate-500">{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
