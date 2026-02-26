'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { transactionsApi } from '../../../lib/api/transactions';
import { categoriesApi } from '../../../lib/api/categories';
import { savingsApi } from '../../../lib/api/savings';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { CurrencyInput } from '../../../components/ui/currency-input';
import { Select } from '../../../components/ui/select';
import { Modal } from '../../../components/ui/modal';
import { EmptyState } from '../../../components/ui/empty-state';
import { formatCurrency, formatDate, formatDateInput } from '../../../lib/utils/format';
import { getCategoryIcon } from '../../../lib/utils/category-icons';
import { Transaction, TransactionFilters } from '../../../types';
import { useTranslation } from '../../../lib/i18n';

export default function TransactionsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currency = user?.currency || 'USD';

  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');

  const [form, setForm] = useState({
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: '',
    date: formatDateInput(new Date()),
    description: '',
  });

  const { data: paginatedResult, isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll(filters),
  });

  const transactions = paginatedResult?.data ?? [];

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: savingsGoals = [] } = useQuery({
    queryKey: ['savings'],
    queryFn: () => savingsApi.getAll(),
  });
  const activeSavingsGoals = savingsGoals.filter((g: any) => !g.isCompleted);

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof transactionsApi.create>[0]) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof transactionsApi.update>[1] }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setDeleteConfirm(null);
    },
  });

  const addSavingsMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => savingsApi.addAmount(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowSavingsModal(false);
      setSelectedGoalId('');
      setSavingsAmount('');
    },
  });

  const filteredCategories = categories.filter((c) => c.type === form.type);

  const openCreate = () => {
    setEditingTx(null);
    setForm({ amount: '', type: 'EXPENSE', categoryId: '', date: formatDateInput(new Date()), description: '' });
    setShowModal(true);
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setForm({
      amount: String(tx.amount),
      type: tx.type,
      categoryId: tx.categoryId,
      date: formatDateInput(tx.date),
      description: tx.description || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTx(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      amount: Number.parseFloat(form.amount),
      type: form.type,
      categoryId: form.categoryId,
      date: form.date,
      description: form.description || undefined,
    };

    if (editingTx) {
      updateMutation.mutate({ id: editingTx.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const renderTransactionList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
        </div>
      );
    }
    if (transactions.length === 0) {
      return (
        <EmptyState
          icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>}
          title={t['transactions.empty']}
          description={t['transactions.emptyHint']}
          action={{ label: t['transactions.new'], onClick: openCreate }}
        />
      );
    }
    return (
      <div className="divide-y divide-[var(--color-border)]">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-[var(--color-bg)] transition-colors overflow-hidden">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                style={{ backgroundColor: tx.category?.color || '#6366f1' }}
              >
                {getCategoryIcon(tx.category?.icon, tx.category?.name, tx.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">
                  {tx.description || tx.category?.name || t['transactions.noDescription']}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--color-text-secondary)]">{formatDate(tx.date)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${tx.type === 'INCOME' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                    {tx.type === 'INCOME' ? t['common.income'] : t['common.expense']}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount), currency)}
              </span>
              <button onClick={() => openEdit(tx)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t['common.edit']}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button onClick={() => setDeleteConfirm(tx.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={t['common.delete']}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">{t['transactions.title']}</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">{t['transactions.subtitle']}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowSavingsModal(true)}>
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {t['transactions.addSavings']}
          </Button>
          <Button onClick={openCreate}>
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t['transactions.new']}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            options={[
              { value: '', label: t['transactions.allTypes'] },
              { value: 'INCOME', label: t['common.incomes'] },
              { value: 'EXPENSE', label: t['common.expenses'] },
            ]}
            value={filters.type || ''}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as any || undefined }))}
          />
          <Input
            type="date"
            label={t['transactions.startDate']}
            value={filters.startDate || ''}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value || undefined }))}
            placeholder="Desde"
          />
          <Input
            type="date"
            label={t['transactions.endDate']}
            value={filters.endDate || ''}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value || undefined }))}
            placeholder="Hasta"
          />
          <Button
            variant="ghost"
            onClick={() => setFilters({})}
            className="flex-shrink-0"
          >
            {t['common.clear']}
          </Button>
        </div>
      </Card>

      {/* Transactions list */}
      <Card padding={false}>
        {renderTransactionList()}
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingTx ? t['transactions.editTitle'] : t['transactions.newTitle']}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'EXPENSE', categoryId: '' }))}
              className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors min-h-[44px] ${
                form.type === 'EXPENSE' ? 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30 text-[var(--color-danger)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
              }`}
            >
              {t['common.expense']}
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'INCOME', categoryId: '' }))}
              className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors min-h-[44px] ${
                form.type === 'INCOME' ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
              }`}
            >
              {t['common.income']}
            </button>
          </div>

          <CurrencyInput
            label={t['common.amount']}
            currency={currency}
            value={form.amount}
            onChange={(val) => setForm((f) => ({ ...f, amount: val }))}
            required
          />

          <Select
            label={t['common.category']}
            options={filteredCategories.map((c) => ({ value: c.id, label: c.name }))}
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            placeholder={t['transactions.selectCategory']}
            required
          />

          <Input
            label={t['common.date']}
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />

          <Input
            label={t['transactions.descriptionOptional']}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={t['transactions.descriptionPlaceholder']}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>{t['common.cancel']}</Button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              {editingTx ? t['common.save'] : t['common.create']}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Savings Modal */}
      <Modal isOpen={showSavingsModal} onClose={() => setShowSavingsModal(false)} title={t['transactions.addSavings']}>
        <form onSubmit={(e) => { e.preventDefault(); if (selectedGoalId && savingsAmount) addSavingsMutation.mutate({ id: selectedGoalId, amount: Number.parseFloat(savingsAmount) }); }} className="space-y-4">
          <Select
            label={t['transactions.savingsGoal']}
            options={activeSavingsGoals.map((g: any) => ({ value: g.id, label: g.name }))}
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            placeholder={t['transactions.selectGoal']}
            required
          />
          <CurrencyInput label={t['common.amount']} currency={currency} value={savingsAmount} onChange={(val) => setSavingsAmount(val)} required />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowSavingsModal(false)}>{t['common.cancel']}</Button>
            <Button type="submit" fullWidth loading={addSavingsMutation.isPending}>{t['common.add']}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={t['transactions.deleteTitle']}>
        <p className="text-[var(--color-text-secondary)] mb-6">
          {t['transactions.deleteConfirm']}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteConfirm(null)}>{t['common.cancel']}</Button>
          <Button variant="danger" fullWidth loading={deleteMutation.isPending} onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>
            {t['common.delete']}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
