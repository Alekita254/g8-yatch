import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Route } from 'lucide-react';

import api from '../api';
import TaxSetupResourcePage from './TaxSetupResourcePage';

const emptyForm = {
  payment_method: '',
  bank_account: '',
  service_point: '',
  service_point_kind: '',
  priority: 1,
  is_active: true,
};

export default function PaymentRoutingRulesPage() {
  const [methodOptions, setMethodOptions] = useState([]);
  const [accountOptions, setAccountOptions] = useState([]);
  const [servicePointOptions, setServicePointOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [methods, accounts, servicePoints] = await Promise.all([
          api.get('/api/payments/methods/', { params: { page_size: 100 } }),
          api.get('/api/payments/bank-accounts/', { params: { page_size: 100 } }),
          api.get('/api/users/service-points/', { params: { page_size: 100 } }),
        ]);
        setMethodOptions(Array.isArray(methods.data.results) ? methods.data.results.map((item) => ({ value: item.id, label: item.name })) : []);
        setAccountOptions(Array.isArray(accounts.data.results) ? accounts.data.results.map((item) => ({ value: item.id, label: item.name })) : []);
        setServicePointOptions(Array.isArray(servicePoints.data.results) ? servicePoints.data.results.map((item) => ({ value: item.id, label: item.name })) : []);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load payment routing options');
      }
    };
    fetchOptions();
  }, []);

  return (
    <TaxSetupResourcePage
      icon={Route}
      title="Payment Routing"
      description="Map each payment method to the correct clearing account by service point or service point kind."
      addLabel="Add Routing Rule"
      endpoint="/api/payments/routing-rules/"
      emptyForm={emptyForm}
      normalize={(form) => ({
        ...form,
        service_point: form.service_point || null,
      })}
      fields={[
        { name: 'payment_method', label: 'Payment method', type: 'select', required: true, placeholder: 'Select method', options: methodOptions },
        { name: 'bank_account', label: 'Bank detail / ledger', type: 'select', required: true, placeholder: 'Select account', options: accountOptions },
        { name: 'service_point', label: 'Specific service point', type: 'select', placeholder: 'Any service point', options: servicePointOptions },
        { name: 'service_point_kind', label: 'Service point kind', placeholder: 'SPA / BAR / RESTAURANT' },
        { name: 'priority', label: 'Priority', type: 'number', min: '1', required: true },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'payment_method_name', label: 'Method' },
        { key: 'bank_account_name', label: 'Account' },
        { key: 'service_point_name', label: 'Point' },
        { key: 'service_point_kind', label: 'Kind' },
      ]}
      summary={{
        title: (item) => `${item.payment_method_name} routing`,
        subtitle: (item) => item.bank_account_name,
      }}
    />
  );
}
