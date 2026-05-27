import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, ListTree, Loader2, Plus } from 'lucide-react';

import api from '../api';
import ProductCategoryFormModal from '../components/ProductCategoryFormModal';

const emptyCategory = {
  name: '',
  code: '',
  parent: null,
  tax_code: '',
  tax_rate: '0.00',
  ui_tab: '',
  route_printer_ip: '',
  route_station: '',
  is_active: true,
};

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyCategory);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/products/categories/');
        setCategories(Array.isArray(response.data.results) ? response.data.results : []);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(emptyCategory);
    setShowAddModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setForm({
      ...category,
      parent: category.parent || null,
      route_printer_ip: category.route_printer_ip || '',
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setForm(emptyCategory);
  };

  const createCategory = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        route_printer_ip: form.route_printer_ip || null,
      };
      const response = editingCategory
        ? await api.patch(`/api/products/categories/${editingCategory.id}/`, payload)
        : await api.post('/api/products/categories/', payload);
      setCategories((current) => (
        editingCategory
          ? current.map((category) => (category.id === response.data.id ? response.data : category))
          : [response.data, ...current]
      ));
      closeModal();
      toast.success(editingCategory ? 'Category updated' : 'Category created');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <ListTree className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-app-text">Product Categories</h2>
            <p className="text-sm text-app-muted">Inherited rules for tax, UI grouping, and order routing.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {categories.map((category) => (
          <article key={category.id} className="rounded-lg border border-app-border bg-app-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-app-text">{category.name}</h3>
                <p className="text-xs font-bold uppercase text-brand-500">{category.parent_name || 'Root category'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-app-elevated px-2 py-1 text-xs font-bold text-app-muted">{category.code}</span>
                <button
                  type="button"
                  onClick={() => openEditModal(category)}
                  className="rounded-md p-2 text-app-muted transition hover:bg-app-elevated hover:text-brand-500"
                  title="Edit category"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-app-muted md:grid-cols-2">
              <p><span className="font-bold text-app-text">Tax:</span> {category.tax_code || 'None'} {category.tax_rate}%</p>
              <p><span className="font-bold text-app-text">UI tab:</span> {category.ui_tab || '-'}</p>
              <p><span className="font-bold text-app-text">Station:</span> {category.route_station || '-'}</p>
              <p><span className="font-bold text-app-text">Printer:</span> {category.route_printer_ip || '-'}</p>
            </div>
          </article>
        ))}
      </div>

      <ProductCategoryFormModal
        isOpen={showAddModal}
        form={form}
        categories={categories}
        onChange={updateForm}
        onClose={closeModal}
        onSubmit={createCategory}
        isSaving={saving}
        isEditing={Boolean(editingCategory)}
      />
    </div>
  );
}
