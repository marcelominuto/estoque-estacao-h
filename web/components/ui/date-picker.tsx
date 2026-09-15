'use client';

import * as React from 'react';
import { format, isValid, parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { CalendarDays } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DatePickerProps = {
  id: string;
  name: string;
  defaultValue?: string | null;
  invalid?: boolean;
};

export function DatePicker({
  id,
  name,
  defaultValue,
  invalid,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!defaultValue) return undefined;
    const parsed = parseISO(defaultValue);
    return isValid(parsed) ? parsed : undefined;
  });
  const [textValue, setTextValue] = React.useState(() => {
    if (!defaultValue) return '';
    const parsed = parseISO(defaultValue);
    return isValid(parsed) ? format(parsed, 'dd/MM/yyyy') : '';
  });
  const [open, setOpen] = React.useState(false);

  const inputValue = date ? format(date, 'yyyy-MM-dd') : '';

  function handleTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 8);
    const masked = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
      .filter(Boolean)
      .join('/');

    setTextValue(masked);

    if (digits.length !== 8) {
      setDate(undefined);
      return;
    }

    const parsed = parse(masked, 'dd/MM/yyyy', new Date());
    setDate(
      isValid(parsed) && format(parsed, 'dd/MM/yyyy') === masked
        ? parsed
        : undefined,
    );
  }

  function handleCalendarSelect(next: Date | undefined) {
    setDate(next);
    setTextValue(next ? format(next, 'dd/MM/yyyy') : '');
    if (next) setOpen(false);
  }

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={textValue}
        onChange={handleTextChange}
        placeholder="dd/mm/aaaa"
        aria-invalid={invalid}
        className="field-control !pr-12"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-invalid={invalid}
              aria-haspopup="dialog"
              aria-label="Abrir calendário"
              className={cn(
                'absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700',
                invalid && 'text-red-400',
              )}
            />
          }
        >
          <CalendarDays className="size-4" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto rounded-xl p-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={inputValue} readOnly />
    </div>
  );
}
