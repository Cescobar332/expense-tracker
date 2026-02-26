'use client';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 12C8 10.8954 8.89543 10 10 10H22C23.1046 10 24 10.8954 24 12V22C24 23.1046 23.1046 24 22 24H10C8.89543 24 8 23.1046 8 22V12Z" stroke="currentColor" strokeWidth="2" />
      <path d="M8 14H24" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="19" r="2" fill="currentColor" />
    </svg>
  );
}

export function LogoWithText({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={28} className="text-[var(--color-primary)]" />
      <span className="text-xl font-bold text-[var(--color-primary)]">FinanceApp</span>
    </div>
  );
}
