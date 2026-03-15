
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'UniRH - Gestão de Servidores',
  description: 'Controle simples de faltas, férias e ocorrências de servidores escolares.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UniRH Elite',
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body antialiased bg-background overflow-x-hidden">
        <AuthProvider>
          <Navbar />
          <div className="min-h-screen">
            {children}
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
