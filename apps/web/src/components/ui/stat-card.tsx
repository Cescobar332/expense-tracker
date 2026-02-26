import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

function getTrendColorClass(trend?: 'up' | 'down' | 'neutral') {
  if (trend === 'up') return 'text-[var(--color-success)]';
  if (trend === 'down') return 'text-[var(--color-danger)]';
  return 'text-[var(--color-text-secondary)]';
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'var(--color-primary)' }: Readonly<StatCardProps>) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-4 md:p-6 min-w-0 overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--color-text-secondary)] truncate">{title}</p>
          <p className="mt-1 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate" style={{ color }}>{value}</p>
          {subtitle && (
            <p className={`mt-1 text-sm ${getTrendColorClass(trend)}`}>
              {trend === 'up' && '\u2191 '}
              {trend === 'down' && '\u2193 '}
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
