'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '../../../lib/api/auth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { LogoWithText } from '../../../components/ui/logo';
import { useTranslation } from '../../../lib/i18n';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[var(--color-bg)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><LogoWithText /></div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">FinanceApp</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">{t['forgotPassword.subtitle']}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--color-success)', borderColor: 'rgba(34,197,94,0.3)' }}>
                {t['forgotPassword.sent']}
              </div>
              <Link href="/login" className="text-[var(--color-primary)] hover:underline font-medium text-sm">
                {t['forgotPassword.backToLogin']}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
                  {error}
                </div>
              )}
              <Input
                label={t['login.email']}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t['login.emailPlaceholder']}
                required
                autoComplete="email"
              />
              <Button type="submit" fullWidth loading={loading}>
                {t['forgotPassword.submit']}
              </Button>
              <p className="text-center text-sm text-[var(--color-text-secondary)]">
                <Link href="/login" className="text-[var(--color-primary)] hover:underline font-medium">
                  {t['forgotPassword.backToLogin']}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
