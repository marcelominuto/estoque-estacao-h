import type { Metadata } from 'next';

import './globals.css';
import { ToastProvider } from '@/components/toast-provider';


export const metadata: Metadata = {
  title: 'Estoque de motos',
  description: 'Controle interno de motos usadas em estoque.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Estação H" />
      </head>
      <body className="font-sans">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
