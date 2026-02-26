'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../../lib/api/categories';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Modal } from '../../../components/ui/modal';
import { EmptyState } from '../../../components/ui/empty-state';
import { getCategoryIcon } from '../../../lib/utils/category-icons';
import { IconPicker } from '../../../components/ui/icon-picker';
import { Category } from '../../../types';
import { useTranslation } from '../../../lib/i18n';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#f59e0b', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6b7280',
];

export default function CategoriesPage() {
  const { t } = useTranslation();
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingCat) {
      updateMutation.mutate({ id: editingCat.id, data: { name: form.name, color: form.color, icon: form.icon || undefined } });
    } else {
      createMutation.mutate({ name: form.name, type: form.type, color: form.color, icon: form.icon || undefined });
    }
  };

  const getTabCount = (tabValue: string): number => {
    if (tabValue === '') return categories.length;
    if (tabValue === 'INCOME') return incomeCategories.length;
    return expenseCategories.length;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" /></div>
      );
    }
    if (filtered.length === 0) {
      return (
        <Card>
          <EmptyState
            icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            title={t['categories.empty']}
            description={t['categories.emptyHint']}
            action={{ label: t['categories.new'], onClick: openCreate }}
          />
        </Card>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((cat) => (
          <div key={cat.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: cat.color }}>
                {getCategoryIcon(cat.icon, cat.name, cat.type)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{cat.name}</p>
                <span className={`text-xs ${cat.type === 'INCOME' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                  {cat.type === 'INCOME' ? t['common.income'] : t['common.expense']}
                </span>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => openEdit(cat)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] rounded min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label={t['common.edit']}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              {!cat.isDefault && (
                <button onClick={() => setDeleteConfirm(cat.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] rounded min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label={t['common.delete']}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
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
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">{t['categories.title']}</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">{t['categories.subtitle']}</p>
        </div>
        <Button onClick={openCreate}>
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t['categories.new']}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { value: '', label: t['common.all'] },
          { value: 'EXPENSE', label: t['common.expenses'] },
          { value: 'INCOME', label: t['common.incomes'] },
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
              ({getTabCount(tab.value)})
            </span>
          </button>
        ))}
      </div>

      {renderContent()}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editingCat ? t['categories.editTitle'] : t['categories.newTitle']}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t['common.name']} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t['categories.namePlaceholder']} required />

          {!editingCat && (
            <div>
              <label htmlFor="category-type" className="block text-sm font-medium text-[var(--color-text)] mb-1">{t['common.type']}</label>
              <div id="category-type" className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm((f) => ({ ...f, type: 'EXPENSE' }))} className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors min-h-[44px] ${form.type === 'EXPENSE' ? 'bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30 text-[var(--color-danger)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                  {t['common.expense']}
                </button>
                <button type="button" onClick={() => setForm((f) => ({ ...f, type: 'INCOME' }))} className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors min-h-[44px] ${form.type === 'INCOME' ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}>
                  {t['common.income']}
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="category-color" className="block text-sm font-medium text-[var(--color-text)] mb-2">{t['common.color']}</label>
            <div id="category-color" className="flex flex-wrap gap-2">
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

          <IconPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} selectedColor={form.color} />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={closeModal}>{t['common.cancel']}</Button>
            <Button type="submit" fullWidth loading={createMutation.isPending || updateMutation.isPending}>{editingCat ? t['common.save'] : t['common.create']}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={t['categories.deleteTitle']}>
        <p className="text-[var(--color-text-secondary)] mb-2">{t['categories.deleteConfirm']}</p>
        <p className="text-sm text-[var(--color-warning)] mb-6">{t['categories.deleteWarning']}</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteConfirm(null)}>{t['common.cancel']}</Button>
          <Button variant="danger" fullWidth loading={deleteMutation.isPending} onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}>{t['common.delete']}</Button>
        </div>
      </Modal>
    </div>
  );
}
