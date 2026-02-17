'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { authApi } from '../../../lib/api/auth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-bg)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">FinanceApp</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">Inicia sesion para gestionar tus finanzas</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-[var(--color-danger)]">
                {error}
              </div>
            )}

            <Input
              label="Correo electronico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />

            <Input
              label="Contrasena"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contrasena"
              required
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth loading={loading}>
              Iniciar sesion
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            No tienes cuenta?{' '}
            <Link href="/register" className="text-[var(--color-primary)] hover:underline font-medium">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
