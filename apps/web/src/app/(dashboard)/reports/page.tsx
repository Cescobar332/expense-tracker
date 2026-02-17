'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { reportsApi } from '../../../lib/api/reports';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { StatCard } from '../../../components/ui/stat-card';
import { formatCurrency, getMonthRange } from '../../../lib/utils/format';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const currency = user?.currency || 'USD';
  const defaultRange = getMonthRange();

  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [period, setPeriod] = useState('MONTHLY');

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', startDate, endDate, period],
    queryFn: () => reportsApi.getSummary({ startDate, endDate, period }),
  });

  const setPreset = (preset: string) => {
    const now = new Date();
    let s: Date, e: Date;
    switch (preset) {
      case 'this-month':
        s = new Date(now.getFullYear(), now.getMonth(), 1);
        e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last-month':
        s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        e = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this-quarter':
        const qStart = Math.floor(now.getMonth() / 3) * 3;
        s = new Date(now.getFullYear(), qStart, 1);
        e = new Date(now.getFullYear(), qStart + 3, 0);
        break;
      case 'this-year':
        s = new Date(now.getFullYear(), 0, 1);
        e = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return;
    }
    setStartDate(s.toISOString().split('T')[0]);
    setEndDate(e.toISOString().split('T')[0]);
  };

  const categoryData = (report?.byCategory || []).map((c) => ({
    name: c.categoryName,
    value: Number(c.total),
    color: c.color,
    percentage: c.percentage,
  }));

  const trendData = (report?.trend || []).map((t) => ({
    date: t.date,
    Ingresos: Number(t.income),
    Gastos: Number(t.expenses),
  }));

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      fontSize: '13px',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">Reportes</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Analiza tus finanzas en detalle</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'this-month', label: 'Este mes' },
              { value: 'last-month', label: 'Mes pasado' },
              { value: 'this-quarter', label: 'Trimestre' },
              { value: 'this-year', label: 'Este ano' },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors min-h-[36px]"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input type="date" label="Desde" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" label="Hasta" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Select
              label="Agrupacion"
              options={[
                { value: 'DAILY', label: 'Diario' },
                { value: 'WEEKLY', label: 'Semanal' },
                { value: 'MONTHLY', label: 'Mensual' },
              ]}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" /></div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <StatCard
              title="Total ingresos"
              value={formatCurrency(report?.summary?.totalIncome || 0, currency)}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>}
              color="var(--color-success)"
            />
            <StatCard
              title="Total gastos"
              value={formatCurrency(report?.summary?.totalExpenses || 0, currency)}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>}
              color="var(--color-danger)"
            />
            <StatCard
              title="Balance neto"
              value={formatCurrency(report?.summary?.balance || 0, currency)}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
              color={(report?.summary?.balance || 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
            />
          </div>

          {/* Trend chart */}
          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Tendencia de ingresos vs gastos</h2>
            {trendData.length > 0 ? (
              <div className="h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" tickFormatter={(v) => formatCurrency(v, currency)} />
                    <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value, currency)} />
                    <Legend />
                    <Bar dataKey="Ingresos" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Gastos" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-[var(--color-text-secondary)] text-sm py-12 text-center">No hay datos para el periodo seleccionado</p>
            )}
          </Card>

          {/* Category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Distribucion por categoria</h2>
              {categoryData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value, currency)} />
                      <Legend verticalAlign="bottom" height={36} formatter={(v: string) => <span className="text-xs">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-[var(--color-text-secondary)] text-sm py-12 text-center">Sin datos</p>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Detalle por categoria</h2>
              {categoryData.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {categoryData
                    .sort((a, b) => b.value - a.value)
                    .map((cat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm text-[var(--color-text)] truncate">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="text-sm font-medium text-[var(--color-text)]">{formatCurrency(cat.value, currency)}</span>
                          <span className="text-xs text-[var(--color-text-secondary)] w-10 text-right">{cat.percentage}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-[var(--color-text-secondary)] text-sm py-12 text-center">Sin datos</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
