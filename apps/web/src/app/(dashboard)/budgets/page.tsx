'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { budgetsApi } from '../../../lib/api/budgets';
import { categoriesApi } from '../../../lib/api/categories';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Modal } from '../../../components/ui/modal';
import { EmptyState } from '../../../components/ui/empty-state';
import { formatCurrency, formatDate, formatDateInput } from '../../../lib/utils/format';
import { Budget } from '../../../types';

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currency = user?.currency || 'USD';

  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const now = new Date();
  const [form, setForm] = useState({
    amount: '',
    categoryId: '',
    period: 'MONTHLY',
    startDate: formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: formatDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    alertAt: '80',
  });

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof budgetsApi.create>[0]) => budgetsApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['budgets'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof budgetsApi.update>[1] }) => budgetsApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['budgets'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['budgets'] }); setDeleteConfirm(null); },
  });

  const openCreate = () => {
    setEditingBudget(null);
    const n = new Date();
    setForm({
      amount: '', categoryId: '', period: 'MONTHLY',
      startDate: formatDateInput(new Date(n.getFullYear(), n.getMonth(), 1)),
      endDate: formatDateInput(new Date(n.getFullYear(), n.getMonth() + 1, 0)),
      alertAt: '80',
    });
    setShowModal(true);
  };

  const openEdit = (b: Budget) => {
    setEditingBudget(b);
    setForm({
      amount: String(b.amount), categoryId: b.categoryId, period: b.period,
      startDate: formatDateInput(b.startDate), endDate: formatDateInput(b.endDate),
      alertAt: String(b.alertAt),
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingBudget(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(form.amount),
      categoryId: form.categoryId,
      period: form.period as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
      startDate: form.startDate,
      endDate: form.endDate,
      alertAt: parseInt(form.alertAt),
    };
    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">Presupuestos</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Controla tus limites de gasto por categoria</p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo presupuesto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" /></div>
      ) : budgets.length === 0 ? (
        <Card>
          <EmptyState
            icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
            title="Sin presupuestos"
            description="Crea un presupuesto para controlar tus gastos"
            action={{ label: 'Crear presupuesto', onClick: openCreate }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const pct = b.percentage || 0;
            const isOver = pct >= 100;
            const isWarning = pct >= (b.alertAt || 80);
            const barColor = isOver ? 'bg-[var(--color-danger)]' : isWarning ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-success)]';
            return (
              <Card key={b.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">{b.category?.name || 'Presupuesto'}</h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {b.period === 'MONTHLY' ? 'Mensual' : b.period === 'QUARTERLY' ? 'Trimestral' : 'Anual'}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(b)} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] rounded" aria-label="Editar">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => setDeleteConfirm(b.id)} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] rounded" aria-label="Eliminar">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--color-text-secondary)]">{formatCurrency(b.spent || 0, currency)}</span>
                    <span className="font-medium text-[var(--color-text)]">{formatCurrency(Number(b.amount), currency)}</span>
                  </div>
                  <div className="w-full bg-[var(--color-border)] rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs font-semibold ${isOver ? 'text-[var(--color-danger)]' : isWarning ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
                      {pct}% usado
                    </span>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      Alerta al {b.alertAt}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                  {formatDate(b.startDate)} - {formatDate(b.endDate)}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingBudget ? 'Editar presupuesto' : 'Nuevo presupuesto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Monto limite" type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required />
          <Select label="Categoria" options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))} value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} placeholder="Selecciona categoria" required />
          <Select label="Periodo" options={[{ value: 'MONTHLY', label: 'Mensual' }, { value: 'QUARTERLY', label: 'Trimestral' }, { value: 'YEARLY', label: 'Anual' }]} value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha inicio" type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} required />
            <Input label="Fecha fin" type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} required />
          </div>
          <Input label="Alerta al (%)" type="number" min="1" max="100" value={form.alertAt} onChange={(e) => setForm((f) => ({ ...f, alertAt: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Cancelar</Button>
            <Button type="submit" fullWidth loading={createMutation.isPending || updateMutation.isPending}>{editingBudget ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar presupuesto">
        <p className="text-[var(--color-text-secondary)] mb-6">Estas seguro de que quieres eliminar este presupuesto?</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="danger" fullWidth loading={deleteMutation.isPending} onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
