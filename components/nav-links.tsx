'use client';

import Link from 'next/link';
import { Bike, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/estoque', label: 'Estoque', icon: Bike },
];

export function NavLinks({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <TooltipProvider delay={250}>
      <nav className="space-y-1" aria-label="Navegação principal">
      <p className={cn('px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400', collapsed && 'sr-only')}>
        Operação
      </p>
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === '/estoque'
          ? pathname === href || (pathname.startsWith('/motos/') && pathname !== '/motos/nova')
          : pathname === href;

        const link = (
          <Link
            href={href}
            aria-label={collapsed ? label : undefined}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'nav-link',
              collapsed && 'justify-center gap-0 px-0 size-11 mx-auto',
              active && '!bg-red-50 !text-primary font-semibold',
            )}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2.25 : 1.75} />
            <span className={collapsed ? 'sr-only' : undefined}>{label}</span>
          </Link>
        );

        return collapsed ? (
          <Tooltip key={href}>
            <TooltipTrigger render={link} />
            <TooltipContent side="right" className="font-semibold">{label}</TooltipContent>
          </Tooltip>
        ) : (
          <div key={href}>{link}</div>
        );
      })}
      </nav>
    </TooltipProvider>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/dashboard"
        aria-current={pathname === '/dashboard' ? 'page' : undefined}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-[background-color,color] duration-150',
          pathname === '/dashboard'
            ? 'bg-red-50 text-primary'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <LayoutDashboard className="size-3.5" strokeWidth={1.75} />
        Dashboard
      </Link>
      <Link
        href="/estoque"
        aria-current={(pathname === '/estoque' || (pathname.startsWith('/motos/') && pathname !== '/motos/nova')) ? 'page' : undefined}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-[background-color,color] duration-150',
          (pathname === '/estoque' || (pathname.startsWith('/motos/') && pathname !== '/motos/nova'))
            ? 'bg-red-50 text-primary'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )}
      >
        <Bike className="size-3.5" strokeWidth={1.75} />
        Estoque
      </Link>
    </div>
  );
}
