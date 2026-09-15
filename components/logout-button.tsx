'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function LogoutButton({
  tone = 'light',
  collapsed = false,
}: {
  tone?: 'light' | 'dark';
  collapsed?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={collapsed ? 'icon' : 'sm'}
      title={collapsed ? 'Sair' : undefined}
      aria-label="Sair"
      className={tone === 'dark'
        ? 'w-full justify-start text-red-100/70 hover:bg-white/10 hover:text-white'
        : collapsed
          ? 'mx-auto text-slate-500 hover:bg-red-50 hover:text-red-700'
          : 'text-slate-500 hover:text-slate-900'}
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      <LogOut data-icon="inline-start" />
      <span className={collapsed ? 'sr-only' : undefined}>Sair</span>
    </Button>
  );
}
