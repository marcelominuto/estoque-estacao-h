'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ChevronDown, LogOut, Settings2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AD';
}

export function AccountMenu({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const initials = initialsFromName(name);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            aria-label="Abrir menu da conta"
            className="h-10 gap-2 rounded-md border-0 bg-transparent px-1 text-left shadow-none hover:bg-slate-50 sm:px-1.5"
          />
        }
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[10px] font-bold text-white ring-1 ring-slate-200">
          {initials}
        </span>
        <span className="hidden min-w-0 xl:block">
          <span className="block max-w-32 truncate text-xs font-bold text-slate-900">{name}</span>
          <span className="block text-[10px] font-medium text-slate-400">Conta administrativa</span>
        </span>
        <ChevronDown className="hidden size-3.5 text-slate-400 sm:block" strokeWidth={1.75} />
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={10} className="w-[280px] p-1.5">
        <PopoverHeader className="rounded-md bg-slate-50 p-3">
          <PopoverTitle className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-950">{name}</span>
              <PopoverDescription className="truncate text-xs">{email}</PopoverDescription>
            </span>
          </PopoverTitle>
        </PopoverHeader>

        <div className="space-y-0.5 pt-1">
          <Link
            href="/configuracoes"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm text-slate-700 transition-[background-color,color] duration-150 hover:bg-red-50 hover:text-primary"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <Settings2 className="size-3.5" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block font-semibold">Configurações da conta</span>
              <span className="block text-xs text-slate-400">Editar seus dados de acesso</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm text-slate-700 transition-[background-color,color] duration-150 hover:bg-red-50 hover:text-red-700"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-red-50 text-red-600">
              <LogOut className="size-3.5" strokeWidth={1.75} />
            </span>
            <span className="font-semibold">Sair</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
