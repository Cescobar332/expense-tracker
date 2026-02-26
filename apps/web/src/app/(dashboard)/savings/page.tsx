'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { savingsApi } from '../../../lib/api/savings';
import { reportsApi } from '../../../lib/api/reports';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { CurrencyInput } from '../../../components/ui/currency-input';
import { Modal } from '../../../components/ui/modal';
import { EmptyState } from '../../../components/ui/empty-state';
import { formatCurrency, formatDate, formatDateInput, getMonthRange } from '../../../lib/utils/format';
import { SavingsGoal } from '../../../types';
import { useTranslation } from '../../../lib/i18n';

export default function SavingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currency = user?.currency || 'USD';

  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [addAmountGoal, setAddAmountGoal] = useState<SavingsGoal | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
  });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['savings'],
    queryFn: () => savingsApi.getAll(),
  });

  const monthRange = getMonthRange();
  const { data: monthReport } = useQuery({
    queryKey: ['report', monthRange.startDate, monthRange.endDate],
    queryFn: () => reportsApi.getSummary({ startDate: monthRange.startDate, endDate: monthRange.endDate, period: 'MONTHLY' }),
    enabled: !!addAmountGoal,
  });

  const available = (monthReport?.summary?.totalIncome || 0) - (monthReport?.summary?.totalExpenses || 0);

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof savingsApi.create>[0]) => savingsApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['savings'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof savingsApi.update>[1] }) => savingsApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['savings'] }); closeModal(); },
  });

  const addAmountMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => savingsApi.addAmount(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setAddAmountGoal(null);
      setAddAmount('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => savingsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['savings'] }); setDeleteConfirm(null); },
  });

  const openCreate = () => {
    setEditingGoal(null);
    setForm({ name: '', targetAmount: '', targetDate: '' });
    setShowModal(true);
  };

  const openEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setForm({
      name: g.name,
      targetAmount: String(g.targetAmount),
      targetDate: g.targetDate ? formatDateInput(g.targetDate) : '',
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingGoal(null); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      targetAmount: Number.parseFloat(form.targetAmount),
      targetDate: form.targetDate || undefined,
    };
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleAddAmount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (addAmountGoal && addAmount) {
      addAmountMutation.mutate({ id: addAmountGoal.id, amount: Number.parseFloat(addAmount) });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" /></div>
      );
    }
    if (goals.length === 0) {
      return (
        <Card>
          <EmptyState
            icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            title={t['savings.empty']}
            description={t['savings.emptyHint']}
            action={{ label: 'Crear meta', onClick: openCreate }}
          />
        </Card>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g) => {
          const target = Number(g.targetAmount);
          const current = Number(g.currentAmount);
          const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
          return (
            <Card key={g.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]">{g.name}</h3>
                  {g.isCompleted && (
                    <span className="text-xs px-2 py-0.5 rounded mt-1 inline-block" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: 'var(--color-success)' }}>{t['savings.completed']}</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] rounded" aria-label={t['common.edit']}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => setDeleteConfirm(g.id)} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] rounded" aria-label={t['common.delete']}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              <div className="text-center mb-3">
                <p className="text-2xl font-bold text-[var(--color-primary)]">{formatCurrency(current, currency)}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">de {formatCurrency(target, currency)}</p>
              </div>

              <div className="w-full bg-[var(--color-border)] rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${g.isCompleted ? 'bg-[var(--color-success)]' : 'bg-[var(--color-primary)]'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-3">
                <span>{pct}% completado</span>
                {g.targetDate && <span>Meta: {formatDate(g.targetDate)}</span>}
              </div>

              {!g.isCompleted && (
                <Button
                  variant="secondary"
                  fullWidth
                  size="sm"
                  onClick={() => { setAddAmountGoal(g); setAddAmount(''); }}
                >
                  Agregar ahorro
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">{t['savings.title']}</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">{t['savings.subtitle']}</p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t['savings.new']}
        </Button>
      </div>

      {renderContent()}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingGoal ? t['savings.editTitle'] : t['savings.newTitle']}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t['savings.goalName']} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t['savings.goalNamePlaceholder']} required />
          <CurrencyInput label={t['savings.targetAmount']} currency={currency} value={form.targetAmount} onChange={(val) => setForm((f) => ({ ...f, targetAmount: val }))} required />
          <Input label={t['savings.targetDate']} type="date" value={form.targetDate} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>{t['common.cancel']}</Button>
            <Button type="submit" fullWidth loading={createMutation.isPending || updateMutation.isPending}>{editingGoal ? t['common.save'] : t['common.create']}</Button>
          </div>
        </form>
      </Modal>

      {/* Add Amount Modal */}
      <Modal isOpen={!!addAmountGoal} onClose={() => setAddAmountGoal(null)} title={`${t['savings.addAmountTitle']} "${addAmountGoal?.name}"`}>
        <form onSubmit={handleAddAmount} className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t['savings.currentProgress']}: {formatCurrency(Number(addAmountGoal?.currentAmount || 0), currency)} de {formatCurrency(Number(addAmountGoal?.targetAmount || 0), currency)}
          </p>
          <p className="text-sm font-medium" style={{ color: available >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {t['savings.availableThisMonth']}: {formatCurrency(available, currency)}
          </p>
          <CurrencyInput label={t['savings.amountToAdd']} currency={currency} value={addAmount} onChange={(val) => setAddAmount(val)} required />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setAddAmountGoal(null)}>{t['common.cancel']}</Button>
            <Button type="submit" fullWidth loading={addAmountMutation.isPending}>{t['common.add']}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={t['savings.deleteTitle']}>
        <p className="text-[var(--color-text-secondary)] mb-6">{t['savings.deleteConfirm']}</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteConfirm(null)}>{t['common.cancel']}</Button>
          <Button variant="danger" fullWidth loading={deleteMutation.isPending} onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>{t['common.delete']}</Button>
        </div>
      </Modal>
    </div>
  );
}
