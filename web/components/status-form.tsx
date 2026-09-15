'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { updateStatusAction } from '@/app/(dashboard)/motos/actions';
import { AppSelect } from '@/components/ui/app-select';
import {
  MOTORCYCLE_STATUS_COLORS,
  type MotorcycleStatus,
} from '@/lib/constants/motorcycle';

export function StatusForm({
  id,
  status,
  size = 'compact',
}: {
  id: string;
  status: MotorcycleStatus;
  size?: 'compact' | 'toolbar';
}) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<MotorcycleStatus>(status);
  const [pending, startTransition] = useTransition();

  function handleStatusChange(value: string) {
    if (!value || value === selectedStatus) return;

    const previousStatus = selectedStatus;
    const nextStatus = value as MotorcycleStatus;
    const formData = new FormData();
    formData.set('id', id);
    formData.set('status', nextStatus);
    setSelectedStatus(nextStatus);

    startTransition(async () => {
      const result = await updateStatusAction(formData);

      if (result.error) {
        setSelectedStatus(previousStatus);
        toast.error(result.error);
        return;
      }

      toast.success(result.success ?? 'Status atualizado com sucesso.');
      router.refresh();
    });
  }

  return (
    <div className="flex items-center">
      <label className="sr-only" htmlFor={`status-${id}`}>Status da moto</label>
      <AppSelect
        id={`status-${id}`}
        value={selectedStatus}
        placeholder="Status"
        size={size}
        disabled={pending}
        className={`!min-w-[120px] !w-[120px] whitespace-nowrap text-xs font-semibold ${MOTORCYCLE_STATUS_COLORS[selectedStatus].trigger}`}
        onValueChange={handleStatusChange}
        options={[
          { value: 'AVAILABLE', label: 'Disponível' },
          { value: 'RESERVED', label: 'Reservada' },
          { value: 'SOLD', label: 'Vendida' },
        ]}
      />
    </div>
  );
}
