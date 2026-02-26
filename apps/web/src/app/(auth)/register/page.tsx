'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../../lib/api/auth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[var(--color-bg)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">FinanceApp</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">Crea tu cuenta para comenzar</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input label="Nombre" value={form.firstName} onChange={updateField('firstName')} required />
              <Input label="Apellido" value={form.lastName} onChange={updateField('lastName')} required />
            </div>

            <Input
              label="Correo electrónico"
              type="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={updateField('password')}
              placeholder="Mínimo 8 caracteres"
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              placeholder="Repite tu contraseña"
              required
              autoComplete="new-password"
            />

            <Button type="submit" fullWidth loading={loading}>
              Crear cuenta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[var(--color-primary)] hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
