'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AccountMenu } from '@/components/account-menu';
import { MobileNav, NavLinks } from '@/components/nav-links';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SIDEBAR_STORAGE_KEY = 'estoque-motos:sidebar-collapsed';

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string };
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'true') return;

    const restoreTimer = window.setTimeout(() => setCollapsed(true), 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#edf0f2] text-slate-950">
      <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
      <div className="min-h-screen overflow-x-clip bg-[#f7f8f9] lg:flex">
        <aside
          aria-label="Navegação principal"
          className={cn(
            'sidebar-nav sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex transition-[width] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
            collapsed ? 'w-[80px]' : 'w-[252px]',
          )}
        >
          <div className={cn('flex border-b border-slate-100', collapsed ? 'h-20 flex-col items-center gap-1 px-3 py-1' : 'h-16 items-center justify-between px-5')}>
            <Link
              href="/estoque"
              aria-label="Ir para o estoque"
              className={cn('flex min-w-0 items-center transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.98]', collapsed ? 'size-10 justify-center' : 'flex-1')}
            >
              {collapsed ? (
                <Image
                  src="/logo-reduzido.png"
                  alt="Estação H Motos"
                  width={44}
                  height={44}
                  priority
                  className="size-10 object-contain"
                />
              ) : (
                <Image
                  src="/cropped-logo-2.png"
                  alt="Estação H Motos"
                  width={170}
                  height={42}
                  priority
                  className="h-auto w-[132px] object-contain object-left"
                />
              )}
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
              aria-expanded={!collapsed}
              className="shrink-0 rounded-md text-slate-400 hover:bg-red-50 hover:text-primary"
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>
          </div>

          <div className={cn('flex-1 py-5', collapsed ? 'px-3' : 'px-4')}>
            <NavLinks collapsed={collapsed} />
          </div>

        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:px-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="hidden h-9 w-[232px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50/70 px-3 text-xs text-slate-400 lg:flex">
                <Search className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span className="flex-1">Pesquisar</span>
                <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">⌘ K</span>
              </div>
            </div>
            <Link href="/estoque" className="flex items-center gap-2.5 font-semibold md:hidden">
              <Image
                src="/cropped-logo-2.png"
                alt="Estação H Motos"
                width={140}
                height={35}
                priority
                className="h-auto w-24 object-contain object-left sm:w-32"
              />
            </Link>
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="lg:hidden"><MobileNav /></div>
              <AccountMenu name={user.name} email={user.email} />
            </div>
          </header>
          <main id="main-content" className="min-h-[calc(100vh-4rem)] w-full px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
