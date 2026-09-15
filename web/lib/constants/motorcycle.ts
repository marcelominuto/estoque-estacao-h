export const MOTORCYCLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
} as const;

export type MotorcycleStatus =
  (typeof MOTORCYCLE_STATUS)[keyof typeof MOTORCYCLE_STATUS];

export const MOTORCYCLE_STATUS_LABELS: Record<MotorcycleStatus, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservada',
  SOLD: 'Vendida',
};

export const MOTORCYCLE_STATUS_TONES: Record<
  MotorcycleStatus,
  'success' | 'warning' | 'neutral'
> = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  SOLD: 'neutral',
};

export const MOTORCYCLE_STATUS_COLORS: Record<
  MotorcycleStatus,
  { trigger: string; badge: string; dot: string }
> = {
  AVAILABLE: {
    trigger: '!rounded-full !border-emerald-200/90 !bg-emerald-50/90 !text-emerald-800 hover:!border-emerald-300 hover:!bg-emerald-100/70 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
    badge: 'rounded-full border border-emerald-200 bg-emerald-50/90 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
    dot: 'bg-emerald-500',
  },
  RESERVED: {
    trigger: '!rounded-full !border-amber-200/90 !bg-amber-50/90 !text-amber-800 hover:!border-amber-300 hover:!bg-amber-100/70 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
    badge: 'rounded-full border border-amber-200 bg-amber-50/90 px-2.5 py-0.5 text-xs font-semibold text-amber-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
    dot: 'bg-amber-500',
  },
  SOLD: {
    trigger: '!rounded-full !border-slate-200 !bg-slate-100/90 !text-slate-700 hover:!border-slate-300 hover:!bg-slate-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
    badge: 'rounded-full border border-slate-200 bg-slate-100/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
    dot: 'bg-slate-400',
  },
};
