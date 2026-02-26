'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../lib/stores/auth-store';
import { useThemeStore } from '../../lib/stores/theme-store';
import { authApi } from '../../lib/api/auth';
import { LogoWithText } from '../ui/logo';

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20AC)' },
  { value: 'GBP', label: 'GBP (\u00A3)' },
  { value: 'COP', label: 'COP ($)' },
  { value: 'MXN', label: 'MXN ($)' },
  { value: 'ARS', label: 'ARS ($)' },
  { value: 'BRL', label: 'BRL (R$)' },
  { value: 'CLP', label: 'CLP ($)' },
  { value: 'PEN', label: 'PEN (S/)' },
];

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  )},
  { href: '/transactions', label: 'Transacciones', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
  )},
  { href: '/budgets', label: 'Presupuestos', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
  )},
  { href: '/savings', label: 'Ahorros', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  )},
  { href: '/categories', label: 'Categor\u00EDas', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
  )},
  { href: '/reports', label: 'Reportes', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  )},
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, setUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const queryClient = useQueryClient();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currencyMutation = useMutation({
    mutationFn: (newCurrency: string) => authApi.updateCurrency(newCurrency),
    onSuccess: (result) => {
      setUser(result.user);
      queryClient.invalidateQueries();
      setShowCurrencyPicker(false);
    },
  });

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
        <div className="flex items-center h-16 px-6 border-b border-[var(--color-border)]">
          <LogoWithText />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--color-border)]">
          {/* Theme toggle */}
          <div className="flex items-center gap-1 mb-3 p-1 bg-[var(--color-border)] rounded-lg">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${theme === 'light' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
              title="Claro"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${theme === 'dark' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
              title="Oscuro"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${theme === 'system' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
              title="Sistema"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-[var(--color-text-secondary)] truncate">{user?.email}</p>
            </div>
          </div>

          {/* Currency selector */}
          <div className="mb-2">
            <button
              onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] rounded-lg transition-colors"
            >
              <span>Moneda: {user?.currency || 'USD'}</span>
              <svg className={`w-4 h-4 transition-transform ${showCurrencyPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCurrencyPicker && (
              <div className="mt-1 p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                <p className="text-xs text-[var(--color-text-secondary)] mb-2 px-1">
                  Se convertir&aacute;n todos los montos
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        if (c.value !== user?.currency && !currencyMutation.isPending) {
                          currencyMutation.mutate(c.value);
                        }
                      }}
                      disabled={currencyMutation.isPending}
                      className={`px-2 py-1.5 text-xs rounded transition-colors ${
                        c.value === user?.currency
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                      } ${currencyMutation.isPending ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {c.value}
                    </button>
                  ))}
                </div>
                {currencyMutation.isPending && (
                  <p className="text-xs text-[var(--color-primary)] mt-2 text-center">
                    Convirtiendo montos...
                  </p>
                )}
                {currencyMutation.isError && (
                  <p className="text-xs text-[var(--color-danger)] mt-2 px-1">
                    {currencyMutation.error instanceof Error ? currencyMutation.error.message : 'Error al cambiar moneda'}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Cerrar sesi&oacute;n
          </button>
        </div>
      </aside>

      {/* Mobile top header bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <LogoWithText />
        <div className="w-10" />
      </header>

      {/* Mobile slide-in drawer overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-[var(--color-surface)] border-r border-[var(--color-border)] transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer header */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--color-border)]">
            <LogoWithText />
            <button
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-colors"
              aria-label="Cerrar menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Drawer footer */}
          <div className="p-4 border-t border-[var(--color-border)]">
            {/* Theme toggle */}
            <div className="flex items-center gap-1 mb-3 p-1 bg-[var(--color-border)] rounded-lg">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${theme === 'light' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
                title="Claro"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${theme === 'dark' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
                title="Oscuro"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 flex items-center justify-center p-1.5 rounded-md text-xs transition-colors ${theme === 'system' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
                title="Sistema"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </button>
            </div>

            {/* Currency selector */}
            <div className="mb-3">
              <button
                onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] rounded-lg transition-colors"
              >
                <span>Moneda: {user?.currency || 'USD'}</span>
                <svg className={`w-4 h-4 transition-transform ${showCurrencyPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showCurrencyPicker && (
                <div className="mt-1 p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2 px-1">
                    Se convertir&aacute;n todos los montos
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => {
                          if (c.value !== user?.currency && !currencyMutation.isPending) {
                            currencyMutation.mutate(c.value);
                          }
                        }}
                        disabled={currencyMutation.isPending}
                        className={`px-2 py-1.5 text-xs rounded transition-colors ${
                          c.value === user?.currency
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                        } ${currencyMutation.isPending ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {c.value}
                      </button>
                    ))}
                  </div>
                  {currencyMutation.isPending && (
                    <p className="text-xs text-[var(--color-primary)] mt-2 text-center">
                      Convirtiendo montos...
                    </p>
                  )}
                  {currencyMutation.isError && (
                    <p className="text-xs text-[var(--color-danger)] mt-2 px-1">
                      {currencyMutation.error instanceof Error ? currencyMutation.error.message : 'Error al cambiar moneda'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-[var(--color-text-secondary)] truncate">{user?.email}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => { closeMobileMenu(); logout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Cerrar sesi&oacute;n
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
