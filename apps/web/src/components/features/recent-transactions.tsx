'use client';

import Link from 'next/link';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils/format';

interface Props {
  transactions: Transaction[];
  currency: string;
}

export function RecentTransactions({ transactions, currency }: Props) {
  if (transactions.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm py-4 text-center">
        No hay transacciones recientes
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
              style={{ backgroundColor: t.category?.color || '#6366f1' }}
            >
              {t.category?.name?.[0]?.toUpperCase() || (t.type === 'INCOME' ? 'I' : 'G')}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">
                {t.description || t.category?.name || 'Sin descripcion'}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">{formatDate(t.date)}</p>
            </div>
          </div>
          <span className={`text-sm font-semibold flex-shrink-0 ml-2 ${
            t.type === 'INCOME' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
          }`}>
            {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount), currency)}
          </span>
        </div>
      ))}
      <Link href="/transactions" className="block text-center text-sm text-[var(--color-primary)] hover:underline py-2">
        Ver todas las transacciones
      </Link>
    </div>
  );
}
