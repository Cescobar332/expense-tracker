'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../../lib/api/auth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { LogoWithText } from '../../../components/ui/logo';
import { useTranslation } from '../../../lib/i18n';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { t } = useTranslation();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t['register.passwordMismatch']);
      return;
    }

    if (form.password.length < 8) {
      setError(t['register.passwordTooShort']);
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, form.password);
      router.push('/login?passwordReset=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-[var(--color-danger)]">{t['resetPassword.invalidToken']}</p>
        <Link href="/login" className="text-[var(--color-primary)] hover:underline font-medium">
          {t['forgotPassword.backToLogin']}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6"><LogoWithText /></div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">FinanceApp</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">{t['resetPassword.subtitle']}</p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
              {error}
            </div>
          )}
          <Input
            label={t['register.password']}
            type="password"
            value={form.password}
            onChange={updateField('password')}
            placeholder={t['register.passwordPlaceholder']}
            required
            autoComplete="new-password"
          />
          <Input
            label={t['register.confirmPassword']}
            type="password"
            value={form.confirmPassword}
            onChange={updateField('confirmPassword')}
            placeholder={t['register.confirmPasswordPlaceholder']}
            required
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth loading={loading}>
            {t['resetPassword.submit']}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6"><LogoWithText /></div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">FinanceApp</h1>
      </div>
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-[var(--color-border)] rounded" />
          <div className="h-10 bg-[var(--color-border)] rounded" />
          <div className="h-10 bg-[var(--color-border)] rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[var(--color-bg)]">
      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
