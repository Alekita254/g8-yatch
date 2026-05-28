import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Loader2, Plus } from 'lucide-react';

import api, { emptyPagination, paginationFromResponse } from '../api';
import DataTable from '../components/DataTable';
import TaxSetupFormModal from '../components/TaxSetupFormModal';

function displayValue(item, key) {
  const value = item[key];
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined || value === '') return '-';
  return value;
}

export default function TaxSetupResourcePage({
  icon: Icon,
  title,
  description,
  addLabel,
  endpoint,
  emptyForm,
  fields,
  columns,
  summary,
  normalize = (value) => value,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState(emptyPagination);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get(endpoint, { params: { page, page_size: pageSize } });
        setItems(Array.isArray(response.data.results) ? response.data.results : []);
        setPagination(paginationFromResponse(response.data, page, pageSize));
      } catch (err) {
        toast.error(err.response?.data?.detail || `Failed to load ${title.toLowerCase()}`);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [endpoint, title, page, pageSize]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const visibleItems = items.filter((item) => [
    summary.title(item),
    summary.subtitle(item),
    ...columns.map((column) => column.render ? column.render(item) : displayValue(item, column.key)),
  ].join(' ').toLowerCase().includes(searchTerm.trim().toLowerCase()));

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({ ...emptyForm, ...item });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = normalize(form);
      const response = editingItem
        ? await api.patch(`${endpoint}${editingItem.id}/`, payload)
        : await api.post(endpoint, payload);

      setItems((current) => (
        editingItem
          ? current.map((item) => (item.id === response.data.id ? response.data : item))
          : [response.data, ...current]
      ));
      closeModal();
      toast.success(editingItem ? `${title} updated` : `${title} created`);
    } catch (err) {
      const detail = err.response?.data?.detail || Object.values(err.response?.data || {})?.[0]?.[0];
      toast.error(detail || `Failed to save ${title.toLowerCase()}`);
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
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-app-text">{title}</h2>
            <p className="text-sm text-app-muted">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>

      <DataTable
        rows={visibleItems}
        columns={[
          {
            key: 'summary',
            header: title,
            render: (item) => (
              <>
                <p className="font-black text-app-text">{summary.title(item)}</p>
                <p className="mt-1 text-xs font-bold uppercase text-brand-500">{summary.subtitle(item)}</p>
              </>
            ),
          },
          ...columns.map((column) => ({
            key: column.key,
            header: column.label,
            render: (item) => column.render ? column.render(item) : displayValue(item, column.key),
          })),
          {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (item) => (
              <button
                type="button"
                onClick={() => openEditModal(item)}
                className="rounded-md border border-app-border p-2 text-app-muted transition hover:bg-app-card hover:text-brand-500"
                title={`Edit ${title}`}
              >
                <Edit3 className="h-4 w-4" />
              </button>
            ),
          },
        ]}
        getRowKey={(item) => item.id}
        title={`${visibleItems.length} ${title.toLowerCase()}`}
        description={`Search ${title.toLowerCase()} by visible table values.`}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={`Search ${title.toLowerCase()}`}
        emptyMessage={items.length ? `No ${title.toLowerCase()} match your search.` : `No ${title.toLowerCase()} yet.`}
        minWidth="920px"
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

      <TaxSetupFormModal
        isOpen={isOpen}
        title={title.toLowerCase()}
        eyebrow={title}
        icon={Icon}
        form={form}
        fields={fields}
        onChange={updateForm}
        onClose={closeModal}
        onSubmit={saveItem}
        isSaving={saving}
        isEditing={Boolean(editingItem)}
      />
    </div>
  );
}
