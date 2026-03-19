'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '../../../lib/api/auth';
import { LogoWithText } from '../../../components/ui/logo';
import { useTranslation } from '../../../lib/i18n';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg(t['verifyEmail.invalidToken']);
      return;
    }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : t['verifyEmail.invalidToken']);
      });
  }, [token, t]);

  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
      {status === 'loading' && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
        </div>
      )}
      {status === 'success' && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--color-success)', borderColor: 'rgba(34,197,94,0.3)' }}>
            {t['verifyEmail.success']}
          </div>
          <Link href="/login" className="text-[var(--color-primary)] hover:underline font-medium text-sm">
            {t['verifyEmail.goToLogin']}
          </Link>
        </div>
      )}
      {status === 'error' && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
            {errorMsg}
          </div>
          <Link href="/login" className="text-[var(--color-primary)] hover:underline font-medium text-sm">
            {t['verifyEmail.goToLogin']}
          </Link>
        </div>
      )}
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-6 md:p-8">
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[var(--color-bg)]">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6"><LogoWithText /></div>
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-4">FinanceApp</h1>

        <Suspense fallback={<VerifyEmailFallback />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
