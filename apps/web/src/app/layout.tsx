import type { Metadata } from 'next';
import { Providers } from '../components/layout/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinanceApp - Control de Finanzas Personales',
  description: 'Aplicacion web para el control integral de finanzas personales',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
