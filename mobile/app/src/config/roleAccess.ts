export type AppRole = 'Admin' | 'Front-desk' | 'Accounting' | 'Sales' | 'Inventory';

export interface RoleWorkspace {
  key: string;
  title: string;
  summary: string;
  role: AppRole;
}

const roleAliases: Record<AppRole, string[]> = {
  Admin: ['admin', 'superuser', 'manager', 'pos_manager'],
  'Front-desk': ['front-desk', 'frontdesk', 'reception', 'concierge'],
  Accounting: ['accounting', 'finance', 'bookkeeper'],
  Sales: ['sales', 'cashier', 'seller', 'pos'],
  Inventory: ['inventory', 'stock', 'storekeeper', 'warehouse'],
};

export const roleOrder: AppRole[] = ['Admin', 'Front-desk', 'Accounting', 'Sales', 'Inventory'];

export const roleWorkspaces: RoleWorkspace[] = [
  {
    key: 'admin-overview',
    title: 'Admin Overview',
    summary: 'Control branches, users, permissions, and platform settings.',
    role: 'Admin',
  },
  {
    key: 'frontdesk-flow',
    title: 'Front-desk',
    summary: 'Handle arrivals, reservations, and customer handoffs quickly.',
    role: 'Front-desk',
  },
  {
    key: 'accounting-workspace',
    title: 'Accounting',
    summary: 'Post entries, reconcile invoices, and manage payable balances.',
    role: 'Accounting',
  },
  {
    key: 'sales-workspace',
    title: 'Sales',
    summary: 'Create orders, collect payments, and issue receipts smoothly.',
    role: 'Sales',
  },
  {
    key: 'inventory-workspace',
    title: 'Inventory',
    summary: 'Track stock levels, adjustments, and low-stock restock actions.',
    role: 'Inventory',
  },
];

function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/[ _]+/g, '-');
}

export function resolveRoles(rawRoles: string[]): AppRole[] {
  const normalized = rawRoles.map(normalize);

  for (const adminAlias of roleAliases.Admin) {
    if (normalized.includes(adminAlias)) {
      return [...roleOrder];
    }
  }

  const resolved = roleOrder.filter((role) =>
    roleAliases[role].some((alias) => normalized.includes(alias)),
  );

  return resolved;
}
