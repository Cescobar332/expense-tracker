'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../lib/utils/format';

interface CategoryData {
  categoryName: string;
  color: string;
  total: number;
  percentage: number;
}

interface Props {
  data: CategoryData[];
  currency: string;
}

export function ExpenseChart({ data, currency }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-[var(--color-text-secondary)] text-sm py-12 text-center">
        No hay datos de gastos para este periodo
      </p>
    );
  }

  const chartData = data.map((d) => ({
    name: d.categoryName,
    value: Number(d.total),
    color: d.color,
  }));

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value, currency)}
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => <span className="text-xs text-[var(--color-text)]">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
