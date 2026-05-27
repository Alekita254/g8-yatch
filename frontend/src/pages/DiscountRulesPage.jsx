import { BadgePercent } from 'lucide-react';

import TaxSetupResourcePage from './TaxSetupResourcePage';

const emptyForm = {
  name: '',
  code: '',
  discount_type: 'PERCENTAGE',
  value: '0.00',
  max_value: '',
  requires_approval: false,
  allowed_roles: '',
  service_point_kinds: '',
  customer_group: '',
  valid_from: '',
  valid_to: '',
  is_active: true,
};

export default function DiscountRulesPage() {
  return (
    <TaxSetupResourcePage
      icon={BadgePercent}
      title="Discount Rules"
      description="Pre-configured discount guardrails for staff, happy hour, corporate, and approval-controlled offers."
      addLabel="Add Discount"
      endpoint="/api/taxes/discounts/"
      emptyForm={emptyForm}
      normalize={(form) => ({
        ...form,
        max_value: form.max_value || null,
        valid_from: form.valid_from || null,
        valid_to: form.valid_to || null,
      })}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'code', label: 'Code', required: true, transform: (value) => value.toLowerCase().replace(/\s+/g, '-') },
        { name: 'discount_type', label: 'Discount type', type: 'select', options: [
          { value: 'PERCENTAGE', label: 'Percentage' },
          { value: 'FIXED', label: 'Fixed amount' },
        ] },
        { name: 'value', label: 'Value', type: 'number', step: '0.01', min: '0', required: true },
        { name: 'max_value', label: 'Maximum value', type: 'number', step: '0.01', min: '0' },
        { name: 'customer_group', label: 'Customer group' },
        { name: 'allowed_roles', label: 'Allowed roles', placeholder: 'POS_MANAGER,ADMIN' },
        { name: 'service_point_kinds', label: 'Service points', placeholder: 'BAR,RESTAURANT' },
        { name: 'valid_from', label: 'Valid from', type: 'datetime-local' },
        { name: 'valid_to', label: 'Valid to', type: 'datetime-local' },
        { name: 'requires_approval', label: 'Requires approval', type: 'checkbox' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'value', label: 'Value', render: (item) => `${item.value}${item.discount_type === 'PERCENTAGE' ? '%' : ''}` },
        { key: 'max_value', label: 'Max' },
        { key: 'requires_approval', label: 'Approval' },
        { key: 'allowed_roles', label: 'Roles' },
      ]}
      summary={{
        title: (item) => item.name,
        subtitle: (item) => item.code,
      }}
    />
  );
}
