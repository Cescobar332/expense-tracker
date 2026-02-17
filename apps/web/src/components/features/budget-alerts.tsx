'use client';

import { Budget } from '../../types';
import { formatCurrency } from '../../lib/utils/format';

interface Props {
  budgets: Budget[];
  currency: string;
}

export function BudgetAlerts({ budgets, currency }: Props) {
  if (budgets.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm py-4 text-center">
        No hay presupuestos configurados
      </p>
    );
  }

  const alertBudgets = budgets
    .filter((b) => (b.percentage || 0) >= (b.alertAt || 80))
    .sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

  if (alertBudgets.length === 0) {
    return (
      <div className="flex flex-col items-center py-6">
        <svg className="w-12 h-12 text-[var(--color-success)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-[var(--color-text-secondary)]">Todos tus presupuestos estan en orden</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alertBudgets.map((b) => {
        const pct = b.percentage || 0;
        const isOver = pct >= 100;
        return (
          <div key={b.id} className="p-3 rounded-lg border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[var(--color-text)]">
                {b.category?.name || 'Presupuesto'}
              </span>
              <span className={`text-xs font-semibold ${isOver ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}`}>
                {pct}%
              </span>
            </div>
            <div className="w-full bg-[var(--color-border)] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${isOver ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-warning)]'}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {formatCurrency(b.spent || 0, currency)} de {formatCurrency(Number(b.amount), currency)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
