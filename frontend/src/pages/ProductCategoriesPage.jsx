import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, ListTree, Loader2, Plus } from 'lucide-react';

import api, { emptyPagination, paginationFromResponse } from '../api';
import DataTable from '../components/DataTable';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState(emptyPagination);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/products/categories/', { params: { page, page_size: pageSize } });
        setCategories(Array.isArray(response.data.results) ? response.data.results : []);
        setPagination(paginationFromResponse(response.data, page, pageSize));
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [page, pageSize]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const visibleCategories = categories.filter((category) => [
    category.name,
    category.code,
    category.parent_name,
    category.tax_code,
    category.ui_tab,
    category.route_station,
    category.route_printer_ip,
  ].join(' ').toLowerCase().includes(searchTerm.trim().toLowerCase()));

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

      <DataTable
        rows={visibleCategories}
        columns={[
          {
            key: 'name',
            header: 'Category',
            render: (category) => (
              <>
                <p className="font-black text-app-text">{category.name}</p>
                <p className="mt-1 text-xs font-bold uppercase text-brand-500">{category.code}</p>
              </>
            ),
          },
          { key: 'parent', header: 'Parent', render: (category) => category.parent_name || 'Root category' },
          { key: 'tax', header: 'Tax', render: (category) => `${category.tax_code || 'None'} ${category.tax_rate}%` },
          { key: 'ui_tab', header: 'UI Tab', render: (category) => category.ui_tab || '-' },
          { key: 'station', header: 'Station', render: (category) => category.route_station || '-' },
          { key: 'printer', header: 'Printer', render: (category) => category.route_printer_ip || '-' },
          {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (category) => (
              <button
                type="button"
                onClick={() => openEditModal(category)}
                className="rounded-md border border-app-border p-2 text-app-muted transition hover:bg-app-card hover:text-brand-500"
                title="Edit category"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            ),
          },
        ]}
        getRowKey={(category) => category.id}
        title={`${visibleCategories.length} categories`}
        description="Search by category, tax, UI tab, routing station, or printer."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search categories"
        emptyMessage="No product categories match your search."
        minWidth="980px"
        pagination={{
          total: pagination.total,
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPages: pagination.totalPages,
          onPageChange: setPage,
          onPageSizeChange: (nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          },
        }}
      />

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
