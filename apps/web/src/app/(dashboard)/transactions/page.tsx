'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { transactionsApi } from '../../../lib/api/transactions';
import { categoriesApi } from '../../../lib/api/categories';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Modal } from '../../../components/ui/modal';
import { EmptyState } from '../../../components/ui/empty-state';
import { formatCurrency, formatDate, formatDateInput } from '../../../lib/utils/format';
import { Transaction, TransactionFilters } from '../../../types';

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currency = user?.currency || 'USD';

  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    categoryId: '',
    date: formatDateInput(new Date()),
    description: '',
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll(filters),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(form.amount),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">Transacciones</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Gestiona tus ingresos y gastos</p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva transaccion
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            options={[
              { value: '', label: 'Todos los tipos' },
              { value: 'INCOME', label: 'Ingresos' },
              { value: 'EXPENSE', label: 'Gastos' },
            ]}
            value={filters.type || ''}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as any || undefined }))}
          />
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value || undefined }))}
            placeholder="Desde"
          />
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value || undefined }))}
            placeholder="Hasta"
          />
          <Button
            variant="ghost"
            onClick={() => setFilters({})}
            className="flex-shrink-0"
          >
            Limpiar
          </Button>
        </div>
      </Card>

      {/* Transactions list */}
      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>}
            title="Sin transacciones"
            description="Registra tu primer ingreso o gasto para comenzar"
            action={{ label: 'Nueva transaccion', onClick: openCreate }}
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-[var(--color-bg)] transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                    style={{ backgroundColor: tx.category?.color || '#6366f1' }}
                  >
                    {tx.category?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {tx.description || tx.category?.name || 'Sin descripcion'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--color-text-secondary)]">{formatDate(tx.date)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${tx.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount), currency)}
                  </span>
                  <button onClick={() => openEdit(tx)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Editar">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => setDeleteConfirm(tx.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Eliminar">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingTx ? 'Editar transaccion' : 'Nueva transaccion'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'EXPENSE', categoryId: '' }))}
              className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors min-h-[44px] ${
                form.type === 'EXPENSE' ? 'bg-red-50 border-red-300 text-red-700' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'INCOME', categoryId: '' }))}
              className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors min-h-[44px] ${
                form.type === 'INCOME' ? 'bg-green-50 border-green-300 text-green-700' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
              }`}
            >
              Ingreso
            </button>
          </div>

          <Input
            label="Monto"
            type="number"
            step="0.01"
            min="0.01"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            required
          />

          <Select
            label="Categoria"
            options={filteredCategories.map((c) => ({ value: c.id, label: c.name }))}
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            placeholder="Selecciona una categoria"
            required
          />

          <Input
            label="Fecha"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />

          <Input
            label="Descripcion (opcional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Ej: Compra del supermercado"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Cancelar</Button>
            <Button type="submit" fullWidth loading={isSubmitting}>
              {editingTx ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar transaccion">
        <p className="text-[var(--color-text-secondary)] mb-6">
          Estas seguro de que quieres eliminar esta transaccion? Esta accion no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="danger" fullWidth loading={deleteMutation.isPending} onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
