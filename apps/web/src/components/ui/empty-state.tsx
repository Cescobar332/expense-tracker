import { ReactNode } from 'react';
import { Button } from './button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-[var(--color-text-secondary)] mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-[var(--color-text-secondary)] mb-6 max-w-sm">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
