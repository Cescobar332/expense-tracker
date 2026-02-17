import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: boolean;
}

export function Card({ children, padding = true, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]
        shadow-sm ${padding ? 'p-4 md:p-6' : ''} ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
