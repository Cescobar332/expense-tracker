import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'var(--color-primary)' }: StatCardProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm p-4 md:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--color-text-secondary)] truncate">{title}</p>
          <p className="mt-1 text-2xl md:text-3xl font-bold" style={{ color }}>{value}</p>
          {subtitle && (
            <p className={`mt-1 text-sm ${
              trend === 'up' ? 'text-[var(--color-success)]' :
              trend === 'down' ? 'text-[var(--color-danger)]' :
              'text-[var(--color-text-secondary)]'
            }`}>
              {trend === 'up' && '↑ '}
              {trend === 'down' && '↓ '}
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
