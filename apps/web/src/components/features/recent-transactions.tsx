'use client';

import Link from 'next/link';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils/format';
import { getCategoryIcon } from '../../lib/utils/category-icons';
import { useTranslation } from '../../lib/i18n';

interface Props {
  transactions: Transaction[];
  currency: string;
}

export function RecentTransactions({ transactions, currency }: Readonly<Props>) {
  const { t } = useTranslation();

  if (transactions.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm py-4 text-center">
        {t['dashboard.noRecentTransactions']}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const description = tx.description || tx.category?.name || t['transactions.noDescription'];
        const formattedAmount = `${tx.type === 'INCOME' ? '+' : '-'}${formatCurrency(Number(tx.amount), currency)}`;

        return (
          <div key={tx.id} className="flex items-center justify-between gap-2 py-3 border-b border-[var(--color-border)] last:border-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                style={{ backgroundColor: tx.category?.color || '#6366f1' }}
              >
                {getCategoryIcon(tx.category?.icon, tx.category?.name, tx.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-text)] truncate" title={description}>
                  {description}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">{formatDate(tx.date)}</p>
              </div>
            </div>
            <span
              className={`text-sm font-semibold flex-shrink-0 ${
                tx.type === 'INCOME' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
              }`}
              title={formattedAmount}
            >
              {formattedAmount}
            </span>
          </div>
        );
      })}
      <Link href="/transactions" className="block text-center text-sm text-[var(--color-primary)] hover:underline py-2">
        {t['dashboard.viewAllTransactions']}
      </Link>
    </div>
  );
}
