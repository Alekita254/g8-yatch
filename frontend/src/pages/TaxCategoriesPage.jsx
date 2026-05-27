import { BookOpenCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import api from '../api';
import TaxSetupResourcePage from './TaxSetupResourcePage';

const emptyForm = {
  name: '',
  code: '',
  etims_code: '',
  description: '',
  taxes: [],
  is_default: false,
  is_active: true,
};

export default function TaxCategoriesPage() {
  const [taxOptions, setTaxOptions] = useState([]);

  useEffect(() => {
    const fetchTaxOptions = async () => {
      try {
        const response = await api.get('/api/taxes/configurations/');
        const options = Array.isArray(response.data.results)
          ? response.data.results.map((tax) => ({ value: tax.id, label: `${tax.name} (${tax.rate}%)` }))
          : [];
        setTaxOptions(options);
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Failed to load tax rule options');
      }
    };
    fetchTaxOptions();
  }, []);

  return (
    <TaxSetupResourcePage
      icon={BookOpenCheck}
      title="Tax Categories"
      description="The eTIMS dictionary that translates hotel products into KRA legal classifications."
      addLabel="Add Category"
      endpoint="/api/taxes/categories/"
      emptyForm={emptyForm}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'code', label: 'Internal code', required: true, transform: (value) => value.toUpperCase() },
        { name: 'etims_code', label: 'eTIMS code', required: true, transform: (value) => value.toUpperCase() },
        { name: 'taxes', label: 'Linked tax rules', type: 'select', multiple: true, options: taxOptions, wide: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'is_default', label: 'Default category', type: 'checkbox' },
        { name: 'is_active', label: 'Active', type: 'checkbox' },
      ]}
      columns={[
        { key: 'etims_code', label: 'eTIMS' },
        { key: 'tax_names', label: 'Taxes' },
        { key: 'is_default', label: 'Default' },
        { key: 'is_active', label: 'Active' },
      ]}
      summary={{
        title: (item) => item.name,
        subtitle: (item) => `Code ${item.code}`,
      }}
    />
  );
}
