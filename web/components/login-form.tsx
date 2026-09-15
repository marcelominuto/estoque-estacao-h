'use client';

import { useState, type ComponentProps } from 'react';
import { signIn } from 'next-auth/react';
import { Loader2, LockKeyhole, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

export function LoginForm() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: LoginSubmitEvent) {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
      callbackUrl: '/dashboard',
    });
    setPending(false);

    if (result?.ok) {
      window.location.assign('/estoque');
    } else {
      toast.error('E-mail ou senha inválidos.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="email" className="field-label">
          E-mail
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input id="email" name="email" type="email" autoComplete="email" required className="field-control !pl-10" placeholder="admin@loja.com" />
        </div>
      </div>
      <div>
        <Label htmlFor="password" className="field-label">
          Senha
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input id="password" name="password" type="password" autoComplete="current-password" required className="field-control !pl-10" placeholder="Sua senha" />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="h-11 w-full rounded-md bg-primary text-primary-foreground shadow-lg shadow-red-900/20 hover:bg-primary/90">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? 'Entrando...' : 'Entrar no sistema'}
      </Button>
    </form>
  );
}
