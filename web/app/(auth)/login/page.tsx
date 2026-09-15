import Image from 'next/image';

import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 text-white lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg-login.png')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-950/20 to-slate-950/55" aria-hidden="true" />
        <div className="relative flex h-full min-h-screen items-start p-10 xl:p-12">
          <div className="w-fit rounded-md bg-white/95 px-2.5 py-1.5">
            <Image
              src="/cropped-logo-2.png"
              alt="Estação H Motos"
              width={190}
              height={48}
              priority
              className="h-auto w-44 object-contain object-left"
            />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-white px-5 py-12 sm:px-10">
        <div className="w-full max-w-md rounded-lg border border-slate-200/80 bg-white p-7 shadow-none sm:p-10">
          <div className="mb-6">
            <Image
              src="/cropped-logo-2.png"
              alt="Estação H Motos"
              width={160}
              height={40}
              priority
              className="h-auto w-36 object-contain"
            />
          </div>
          <h1 className="mb-7 text-2xl font-bold tracking-tight text-slate-950">Entre no seu estoque</h1>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
