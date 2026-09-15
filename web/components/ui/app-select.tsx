'use client';

import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type AppSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type AppSelectProps = {
  id?: string;
  name?: string;
  value?: string | null;
  defaultValue?: string;
  placeholder: string;
  options: AppSelectOption[];
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  size?: 'default' | 'toolbar' | 'compact';
  className?: string;
  onValueChange?: (value: string) => void;
};

export function AppSelect({
  id,
  name,
  value,
  defaultValue,
  placeholder,
  options,
  disabled,
  required,
  invalid,
  size = 'default',
  className,
  onValueChange,
}: AppSelectProps) {
  const selectionProps = value !== undefined
    ? { value: value || null }
    : { defaultValue };
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <Select
      {...selectionProps}
      name={name}
      disabled={disabled}
      required={required}
      onValueChange={(next) => onValueChange?.(next ?? '')}
    >
      <SelectTrigger
        id={id}
        aria-invalid={invalid}
        size={size === 'compact' ? 'sm' : 'default'}
        className={cn(
          'field-select-trigger',
          size === 'toolbar' && '!h-10 !rounded-md !shadow-none',
          size === 'compact' && '!h-8 !rounded-md !px-2 !shadow-none',
          className,
        )}
      >
        <SelectValue placeholder={placeholder}>
          {selectedLabel ?? ((next: string | null) => options.find((option) => option.value === next)?.label ?? placeholder)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        side="bottom"
        sideOffset={6}
        align="start"
        alignItemWithTrigger={false}
        className="max-h-72 rounded-lg p-1.5"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="rounded-md px-3 py-2.5 text-sm data-highlighted:bg-red-50 data-highlighted:text-red-800"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
