'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../../lib/api/categories';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Modal } from '../../../components/ui/modal';
import { EmptyState } from '../../../components/ui/empty-state';
import { Category } from '../../../types';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#f59e0b', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6b7280',
];

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  const [form, setForm] = useState({
    name: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    color: '#6366f1',
    icon: '',
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof categoriesApi.create>[0]) => categoriesApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof categoriesApi.update>[1] }) => categoriesApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setDeleteConfirm(null); },
  });

  const filtered = filterType ? categories.filter((c) => c.type === filterType) : categories;
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  const openCreate = () => {
    setEditingCat(null);
    setForm({ name: '', type: 'EXPENSE', color: '#6366f1', icon: '' });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setForm({ name: cat.name, type: cat.type, color: cat.color, icon: cat.icon || '' });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingCat(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCat) {
      updateMutation.mutate({ id: editingCat.id, data: { name: form.name, color: form.color, icon: form.icon || undefined } });
    } else {
      createMutation.mutate({ name: form.name, type: form.type, color: form.color, icon: form.icon || undefined });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">Categorias</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Organiza tus transacciones por categorias</p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva categoria
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { value: '', label: 'Todas' },
          { value: 'EXPENSE', label: 'Gastos' },
          { value: 'INCOME', label: 'Ingresos' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] ${
              filterType === tab.value
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-border)]'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-75">
              ({tab.value === '' ? categories.length : tab.value === 'INCOME' ? incomeCategories.length : expenseCategories.length})
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            title="Sin categorias"
            description="Crea categorias para organizar tus transacciones"
            action={{ label: 'Crear categoria', onClick: openCreate }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((cat) => (
            <div key={cat.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: cat.color }}>
                  {cat.icon || cat.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{cat.name}</p>
                  <span className={`text-xs ${cat.type === 'INCOME' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                    {cat.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(cat)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] rounded min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Editar">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                {!cat.isDefault && (
                  <button onClick={() => setDeleteConfirm(cat.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] rounded min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Eliminar">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingCat ? 'Editar categoria' : 'Nueva categoria'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Alimentacion, Transporte" required />

          {!editingCat && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Tipo</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm((f) => ({ ...f, type: 'EXPENSE' }))} className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors min-h-[44px] ${form.type === 'EXPENSE' ? 'bg-red-50 border-red-300 text-red-700' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                  Gasto
                </button>
                <button type="button" onClick={() => setForm((f) => ({ ...f, type: 'INCOME' }))} className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors min-h-[44px] ${form.type === 'INCOME' ? 'bg-green-50 border-green-300 text-green-700' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                  Ingreso
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${form.color === color ? 'border-[var(--color-text)] scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>

          <Input label="Icono (emoji opcional)" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="Ej: 🍔 🚗 💰" maxLength={2} />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>Cancelar</Button>
            <Button type="submit" fullWidth loading={createMutation.isPending || updateMutation.isPending}>{editingCat ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar categoria">
        <p className="text-[var(--color-text-secondary)] mb-2">Estas seguro de que quieres eliminar esta categoria?</p>
        <p className="text-sm text-[var(--color-warning)] mb-6">Las transacciones asociadas no se eliminaran, pero quedaran sin categoria.</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="danger" fullWidth loading={deleteMutation.isPending} onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  );
}
