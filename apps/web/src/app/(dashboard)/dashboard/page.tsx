'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { reportsApi } from '../../../lib/api/reports';
import { transactionsApi } from '../../../lib/api/transactions';
import { savingsApi } from '../../../lib/api/savings';
import { budgetsApi } from '../../../lib/api/budgets';
import { StatCard } from '../../../components/ui/stat-card';
import { Card } from '../../../components/ui/card';
import { formatCurrency, getMonthRange } from '../../../lib/utils/format';
import { RecentTransactions } from '../../../components/features/recent-transactions';
import { ExpenseChart } from '../../../components/features/expense-chart';
import { BudgetAlerts } from '../../../components/features/budget-alerts';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { startDate, endDate } = getMonthRange(selectedDate);

  const goToPreviousMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  const monthLabel = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(selectedDate);

  const now = new Date();
  const isCurrentMonth = selectedDate.getMonth() === now.getMonth()
    && selectedDate.getFullYear() === now.getFullYear();

  const { data: report } = useQuery({
    queryKey: ['report', startDate, endDate],
    queryFn: () => reportsApi.getSummary({ startDate, endDate }),
  });

  const { data: transactionsResult } = useQuery({
    queryKey: ['transactions', 'recent', startDate, endDate],
    queryFn: () => transactionsApi.getAll({ limit: 5, startDate, endDate }),
  });

  const { data: savings } = useQuery({
    queryKey: ['savings'],
    queryFn: () => savingsApi.getAll(),
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.getAll(),
  });

  const totalSavings = savings?.reduce((sum, s) => sum + Number(s.currentAmount), 0) || 0;
  const currency = user?.currency || 'USD';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">
            Hola, {user?.firstName}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Resumen de tus finanzas
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Mes anterior"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-sm font-medium text-[var(--color-text)] min-w-[160px] text-center capitalize">
            {monthLabel}
          </span>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Mes siguiente"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {!isCurrentMonth && (
            <button
              onClick={goToCurrentMonth}
              className="ml-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 min-h-[36px]"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Ingresos"
          value={formatCurrency(report?.summary?.totalIncome || 0, currency)}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>}
          color="var(--color-success)"
        />
        <StatCard
          title="Gastos"
          value={formatCurrency(report?.summary?.totalExpenses || 0, currency)}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>}
          color="var(--color-danger)"
        />
        <StatCard
          title="Balance"
          value={formatCurrency(report?.summary?.balance || 0, currency)}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
          color={(report?.summary?.balance || 0) >= 0 ? 'var(--color-info)' : 'var(--color-danger)'}
        />
        <StatCard
          title="Ahorros"
          value={formatCurrency(totalSavings, currency)}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          color="var(--color-warning)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="overflow-hidden">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Gastos por categoría</h2>
          <ExpenseChart data={report?.byCategory || []} currency={currency} />
        </Card>
        <Card className="overflow-hidden">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Alertas de presupuesto</h2>
          <BudgetAlerts budgets={budgets || []} currency={currency} />
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Transacciones recientes</h2>
        <RecentTransactions transactions={transactionsResult?.data || []} currency={currency} />
      </Card>
    </div>
  );
}
