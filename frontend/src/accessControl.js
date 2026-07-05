export const APP_ACCESS = {
  admin: {
    label: 'Admin Console',
    permissions: ['app.admin'],
  },
  frontdesk: {
    label: 'Frontdesk',
    permissions: ['app.frontdesk'],
  },
  sales: {
    label: 'Sales',
    permissions: ['app.sales'],
  },
  accounting: {
    label: 'Accounting',
    permissions: ['app.accounting'],
  },
  inventory: {
    label: 'Inventory',
    permissions: ['app.inventory'],
  },
};

export const APP_PERMISSION_OPTIONS = Object.entries(APP_ACCESS).map(([value, access]) => ({
  value,
  label: access.label,
  permission: access.permissions[0],
}));

export function profileRoles(profileData) {
  return profileData?.roles || profileData?.identity?.realm_roles || [];
}

export function profilePermissions(profileData) {
  return profileData?.permissions || [];
}

export function canAccessApp(profileData, appKey) {
  const access = APP_ACCESS[appKey];
  if (!access) return false;

  const permissions = new Set(profilePermissions(profileData));

  return access.permissions.some((permission) => permissions.has(permission));
}

export function hasAnyAppAccess(profileData) {
  return Object.keys(APP_ACCESS).some((appKey) => canAccessApp(profileData, appKey));
}
