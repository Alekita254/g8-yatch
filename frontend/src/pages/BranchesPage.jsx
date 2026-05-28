import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { GitBranch } from 'lucide-react';

import api from '../api';
import TaxSetupResourcePage from './TaxSetupResourcePage';

const emptyForm = {
  organization: '',
  name: '',
  code: '',
  branch_type: '',
  location: '',
  kra_pin: '',
  phone: '',
  email: '',
  is_headquarters: false,
  is_active: true,
};

export default function BranchesPage() {
  const [organizationOptions, setOrganizationOptions] = useState([]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await api.get('/api/organisation/organizations/', { params: { page_size: 100 } });
        setOrganizationOptions(
          Array.isArray(response.data.results)
            ? response.data.results.map((org) => ({ value: org.id, label: org.name }))
            : []
        );
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load organizations');
      }
    };
    fetchOrganizations();
  }, []);

  return (
    <TaxSetupResourcePage
      icon={GitBranch}
      title="Branches"
      description="Property-level isolation for menus, inventory, sales, tax routing, and reports."
      addLabel="Add Branch"
      endpoint="/api/organisation/branches/"
      emptyForm={emptyForm}
      fields={[
        { name: 'organization', label: 'Organization', type: 'select', required: true, placeholder: 'Select organization', options: organizationOptions },
        { name: 'name', label: 'Name', required: true },
        { name: 'code', label: 'Code', required: true, transform: (value) => value.toLowerCase().replace(/\s+/g, '-') },
        { name: 'branch_type', label: 'Branch type', placeholder: 'CITY_HOTEL / RESORT' },
        { name: 'location', label: 'Location' },
        { name: 'kra_pin', label: 'KRA PIN', transform: (value) => value.toUpperCase() },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'is_headquarters', label: 'Headquarters', type: 'checkbox' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'organization_name', label: 'Organization' },
        { key: 'branch_type', label: 'Type' },
        { key: 'location', label: 'Location' },
        { key: 'kra_pin', label: 'KRA PIN' },
      ]}
      summary={{
        title: (item) => item.name,
        subtitle: (item) => item.code,
      }}
    />
  );
}
