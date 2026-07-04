import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Loader2, Plus } from 'lucide-react';

import api, { emptyPagination, paginationFromResponse } from '../api';
import DataTable from '../components/DataTable';
import TaxSetupFormModal from '../components/TaxSetupFormModal';
import useFrontdeskData from './useFrontdeskData';

const baseConfigs = {
  partners: {
    title: 'Guests & Customers',
    description: 'Guests, corporate clients, agents, and other people or companies the hotel serves.',
    empty: 'No guests or customers yet.',
    endpoint: '/api/business-partners/',
    addLabel: 'Add Guest / Customer',
    emptyForm: {
      code: '',
      partner_type: 'GUEST',
      display_name: '',
      email: '',
      phone: '',
      nationality: '',
      id_document_type: '',
      id_document_number: '',
      visa_expiry_date: '',
      can_charge_to_room: false,
      credit_limit: '0.00',
      is_active: true,
    },
    fields: [
      { name: 'display_name', label: 'Display name', required: true },
      { name: 'code', label: 'Code', required: true, transform: (value) => value.toLowerCase().replace(/\s+/g, '-') },
      { name: 'partner_type', label: 'Type', type: 'select', options: [
        { value: 'GUEST', label: 'Guest' },
        { value: 'CORPORATE', label: 'Corporate Client' },
        { value: 'TRAVEL_AGENT', label: 'Travel Agent' },
        { value: 'SUPPLIER', label: 'Supplier' },
        { value: 'STAFF', label: 'Staff' },
      ] },
      { name: 'nationality', label: 'Nationality' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone' },
      { name: 'id_document_type', label: 'ID document type' },
      { name: 'id_document_number', label: 'ID / passport number' },
      { name: 'visa_expiry_date', label: 'Visa expiry date', type: 'date' },
      { name: 'credit_limit', label: 'Credit limit', type: 'number', step: '0.01', min: '0' },
      { name: 'can_charge_to_room', label: 'Can charge to room', type: 'checkbox' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [['Name', 'display_name'], ['Type', 'partner_type_display'], ['Email', 'email'], ['Phone', 'phone'], ['Room Charge', 'can_charge_to_room']],
  },
  rooms: {
    title: 'Rooms',
    description: 'Physical room inventory and live operational status.',
    empty: 'No rooms yet.',
    endpoint: '/api/rooms/',
    addLabel: 'Add Room',
    emptyForm: { number: '', capacity: 1, status: 'AVAILABLE', is_active: true },
    columns: [['Room', 'number'], ['People', 'capacity'], ['Status', 'status_display']],
  },
  reservations: {
    title: 'Reservations',
    description: 'Booking lifecycle from enquiry to checked-out.',
    empty: 'No reservations yet.',
    endpoint: '/api/reservations/',
    addLabel: 'Add Reservation',
    emptyForm: {
      business_partner: '',
      room: '',
      check_in_date: '',
      check_out_date: '',
      adults: 1,
      children: 0,
      status: 'ENQUIRY',
      source: '',
      channel_reference: '',
      deposit_due_at: '',
      notes: '',
    },
    columns: [['Reservation', 'reservation_number'], ['Guest', 'guest_name'], ['Room', 'room_number'], ['Check-in', 'check_in_date'], ['Check-out', 'check_out_date'], ['Status', 'status']],
  },
};

function valueFor(item, key) {
  const value = item[key];
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value || '-';
}

function optionList(items, labelKey, valueKey = 'id') {
  return items.map((item) => ({ value: item[valueKey], label: item[labelKey] }));
}

export default function FrontdeskListPage({ type }) {
  const { data, loading, refresh } = useFrontdeskData();
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const config = baseConfigs[type];
  const [form, setForm] = useState(config.emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState(emptyPagination);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        setRowsLoading(true);
        const response = await api.get(config.endpoint, { params: { page, page_size: pageSize } });
        setRows(response.data.results || []);
        setPagination(paginationFromResponse(response.data, page, pageSize));
      } catch (err) {
        toast.error(err.response?.data?.detail || `Failed to load ${config.title.toLowerCase()}`);
      } finally {
        setRowsLoading(false);
      }
    };

    fetchRows();
  }, [config.endpoint, config.title, page, pageSize]);

  const dynamicFields = useMemo(() => {
    if (type === 'rooms') {
      return [
        { name: 'number', label: 'Room title', required: true },
        { name: 'capacity', label: 'People', type: 'number', min: '1', required: true },
      ];
    }

    if (type === 'reservations') {
      return [
        { name: 'business_partner', label: 'Guest / customer', type: 'select', required: true, placeholder: 'Select guest', options: optionList(data.partners, 'display_name') },
        { name: 'room', label: 'Room', type: 'select', placeholder: 'Assign later', options: optionList(data.rooms, 'number') },
        { name: 'check_in_date', label: 'Check-in date', type: 'date', required: true },
        { name: 'check_out_date', label: 'Check-out date', type: 'date', required: true },
        { name: 'adults', label: 'Adults', type: 'number', min: '1' },
        { name: 'children', label: 'Children', type: 'number', min: '0' },
        { name: 'status', label: 'Status', type: 'select', options: ['ENQUIRY', 'TENTATIVE', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map((value) => ({ value, label: value.replace(/_/g, ' ') })) },
        { name: 'source', label: 'Source' },
        { name: 'channel_reference', label: 'Channel reference' },
        { name: 'deposit_due_at', label: 'Deposit due at', type: 'datetime-local' },
        { name: 'notes', label: 'Notes', type: 'textarea' },
      ];
    }

    return config.fields;
  }, [config.fields, data.partners, data.rooms, type]);

  const visibleRows = rows.filter((row) => config.columns
    .map(([, key]) => valueFor(row, key))
    .join(' ')
    .toLowerCase()
    .includes(searchTerm.trim().toLowerCase()));
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setEditingItem(null);
    setForm(config.emptyForm);
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const editable = Object.keys(config.emptyForm).reduce((acc, key) => {
      acc[key] = item[key] ?? config.emptyForm[key];
      return acc;
    }, {});
    setForm({ ...config.emptyForm, ...editable });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingItem(null);
    setForm(config.emptyForm);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = Object.keys(config.emptyForm).reduce((acc, key) => {
        acc[key] = form[key];
        return acc;
      }, {});
      ['branch', 'room', 'business_partner', 'reservation', 'deposit_due_at', 'visa_expiry_date'].forEach((key) => {
        if (key in payload) payload[key] = payload[key] || null;
      });
      if (editingItem) {
        await api.patch(`${config.endpoint}${editingItem.id}/`, payload);
      } else {
        await api.post(config.endpoint, payload);
      }
      toast.success(editingItem ? `${config.title} updated` : `${config.title} created`);
      closeModal();
      refresh();
      const response = await api.get(config.endpoint, { params: { page, page_size: pageSize } });
      setRows(response.data.results || []);
      setPagination(paginationFromResponse(response.data, page, pageSize));
    } catch (err) {
      const detail = err.response?.data?.detail || Object.values(err.response?.data || {})?.[0]?.[0];
      toast.error(detail || `Failed to save ${config.title.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || rowsLoading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-app-border bg-app-card p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-app-text">{config.title}</h2>
          <p className="mt-1 text-sm text-app-muted">{config.description}</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          {config.addLabel}
        </button>
      </div>

      <DataTable
        rows={visibleRows}
        columns={[
          ...config.columns.map(([label, key]) => ({
            key,
            header: label,
            cellClassName: 'font-medium text-app-text',
            render: (row) => valueFor(row, key),
          })),
          {
            key: 'actions',
            header: 'Action',
            headerClassName: 'text-right',
            cellClassName: 'text-right',
            render: (row) => (
              <button type="button" onClick={() => openEdit(row)} className="rounded-md p-2 text-app-muted transition hover:bg-app-elevated hover:text-brand-500" title="Edit">
                <Edit3 className="h-4 w-4" />
              </button>
            ),
          },
        ]}
        getRowKey={(row) => row.id}
        title={`${visibleRows.length} records`}
        description={`Search ${config.title.toLowerCase()} by visible table values.`}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={`Search ${config.title.toLowerCase()}`}
        emptyMessage={rows.length ? `No ${config.title.toLowerCase()} match your search.` : config.empty}
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
        title={config.title.toLowerCase()}
        eyebrow={config.title}
        icon={Plus}
        form={form}
        fields={dynamicFields}
        onChange={updateForm}
        onClose={closeModal}
        onSubmit={saveItem}
        isSaving={saving}
        isEditing={Boolean(editingItem)}
      />
    </div>
  );
}
