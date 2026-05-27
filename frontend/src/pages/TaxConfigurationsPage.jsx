import { Calculator } from 'lucide-react';

import TaxSetupResourcePage from './TaxSetupResourcePage';

const emptyForm = {
  name: '',
  code: '',
  rate: '0.000',
  calculation_type: 'PERCENTAGE',
  application_order: 1,
  is_compound: false,
  ledger_account: '',
  effective_from: '',
  effective_to: '',
  is_active: true,
};

export default function TaxConfigurationsPage() {
  return (
    <TaxSetupResourcePage
      icon={Calculator}
      title="Tax Configurations"
      description="The math engine for VAT, levies, service charges, and liability ledgers."
      addLabel="Add Tax Rule"
      endpoint="/api/taxes/configurations/"
      emptyForm={emptyForm}
      normalize={(form) => ({
        ...form,
        effective_from: form.effective_from || null,
        effective_to: form.effective_to || null,
      })}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'code', label: 'Code', required: true, transform: (value) => value.toLowerCase().replace(/\s+/g, '-') },
        { name: 'rate', label: 'Rate', type: 'number', step: '0.001', min: '0', required: true },
        { name: 'calculation_type', label: 'Calculation type', type: 'select', options: [
          { value: 'PERCENTAGE', label: 'Percentage' },
          { value: 'FIXED', label: 'Fixed amount' },
        ] },
        { name: 'application_order', label: 'Application order', type: 'number', min: '1', required: true },
        { name: 'ledger_account', label: 'Ledger account' },
        { name: 'effective_from', label: 'Effective from', type: 'date' },
        { name: 'effective_to', label: 'Effective to', type: 'date' },
        { name: 'is_compound', label: 'Compound calculation', type: 'checkbox' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'rate', label: 'Rate', render: (item) => `${item.rate}${item.calculation_type === 'PERCENTAGE' ? '%' : ''}` },
        { key: 'application_order', label: 'Order' },
        { key: 'ledger_account', label: 'Ledger' },
        { key: 'is_compound', label: 'Compound' },
      ]}
      summary={{
        title: (item) => item.name,
        subtitle: (item) => item.code,
      }}
    />
  );
}
