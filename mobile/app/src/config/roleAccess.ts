export type AppRole = 'Admin' | 'Front-desk' | 'Accounting' | 'Sales' | 'Inventory';

export interface RoleWorkspace {
  key: string;
  title: string;
  role: AppRole;
}

const roleAliases: Record<AppRole, string[]> = {
  Admin: ['admin', 'superuser', 'manager', 'pos_manager', 'pos-manager'],
  'Front-desk': ['front-desk', 'frontdesk', 'reception', 'concierge'],
  Accounting: ['accounting', 'finance', 'bookkeeper'],
  Sales: ['sales', 'cashier', 'seller', 'pos'],
  Inventory: ['inventory', 'stock', 'storekeeper', 'warehouse'],
};

const permissionToRole: Record<string, AppRole> = {
  'app.admin': 'Admin',
  'app.frontdesk': 'Front-desk',
  'app.accounting': 'Accounting',
  'app.sales': 'Sales',
  'app.inventory': 'Inventory',
};

export const roleOrder: AppRole[] = ['Admin', 'Front-desk', 'Accounting', 'Sales', 'Inventory'];

export const roleWorkspaces: RoleWorkspace[] = [
  {
    key: 'admin-overview',
    title: 'Admin Overview',
    role: 'Admin',
  },
  {
    key: 'frontdesk-flow',
    title: 'Front-desk',
    role: 'Front-desk',
  },
  {
    key: 'accounting-workspace',
    title: 'Accounting',
    role: 'Accounting',
  },
  {
    key: 'sales-workspace',
    title: 'Sales',
    role: 'Sales',
  },
  {
    key: 'inventory-workspace',
    title: 'Inventory',
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

export function resolveRolesFromPermissions(rawPermissions: string[]): AppRole[] {
  const normalizedPermissions = new Set(rawPermissions.map((permission) => permission.trim().toLowerCase()));

  if (normalizedPermissions.has('app.admin')) {
    return [...roleOrder];
  }

  const resolved = roleOrder.filter((role) =>
    Array.from(normalizedPermissions).some((permission) => permissionToRole[permission] === role),
  );

  return resolved;
}
