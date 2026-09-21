import type { AdminSummary } from '../types/adminSummary';

export const metricColors = [
  { accent: '#1E8A63', soft: '#EAF6F1' },
  { accent: '#2C6ED5', soft: '#EBF2FF' },
  { accent: '#CF8A12', soft: '#FFF5E6' },
  { accent: '#7B5CC9', soft: '#F2EDFF' },
  { accent: '#1F7A8C', soft: '#E8F5F7' },
  { accent: '#C35D22', soft: '#FFF0E8' },
] as const;

export const shortcuts = [
  {
    icon: 'people-outline',
    title: 'User Setup',
    subtitle: 'Roles and service points',
    accent: '#1E8A63',
    soft: '#EAF6F1',
  },
  {
    icon: 'cube-outline',
    title: 'Products',
    subtitle: 'Items and categories',
    accent: '#2C6ED5',
    soft: '#EBF2FF',
  },
  {
    icon: 'bed-outline',
    title: 'Rooms',
    subtitle: 'Inventory mapping',
    accent: '#7B5CC9',
    soft: '#F2EDFF',
  },
  {
    icon: 'pricetag-outline',
    title: 'Taxes & Discount',
    subtitle: 'Compliance setup',
    accent: '#CF8A12',
    soft: '#FFF5E6',
  },
  {
    icon: 'calculator-outline',
    title: 'Accounting',
    subtitle: 'Ledgers and journals',
    accent: '#1F7A8C',
    soft: '#E8F5F7',
  },
  {
    icon: 'card-outline',
    title: 'Payment',
    subtitle: 'Routing and methods',
    accent: '#C35D22',
    soft: '#FFF0E8',
  },
  {
    icon: 'download-outline',
    title: 'Downloads',
    subtitle: 'Installer and data dump',
    accent: '#4D7C0F',
    soft: '#EEF8DF',
  },
  {
    icon: 'layers-outline',
    title: 'Inventory',
    subtitle: 'Stock and RFP flow',
    accent: '#A444D4',
    soft: '#F7EDFF',
  },
  {
    icon: 'business-outline',
    title: 'Organisation Setup',
    subtitle: 'Branches and structure',
    accent: '#AF3B5C',
    soft: '#FFEFF3',
  },
] as const;

const featuredShortcutKeys = new Set([
  'User Setup',
  'Products',
  'Rooms',
  'Taxes & Discount',
  'Accounting',
  'Payment',
]);

export function getFeaturedShortcuts() {
  return shortcuts.filter((item) => featuredShortcutKeys.has(item.title));
}

export function getAdminMenuItems() {
  return [
    { key: 'dashboard', title: 'Dashboard', icon: 'grid-outline' as const },
    ...shortcuts.map((item) => ({
      key: item.title,
      title: item.title,
      icon: item.icon,
    })),
  ];
}

export function buildAdminMetrics(summary: AdminSummary | null) {
  if (!summary) {
    return [
      {
        icon: 'people-outline' as const,
        label: 'Active Users',
        value: '--',
        meta: 'Waiting for sync',
      },
      {
        icon: 'cube-outline' as const,
        label: 'Active Products',
        value: '--',
        meta: 'Waiting for sync',
      },
      {
        icon: 'pricetag-outline' as const,
        label: 'Low Stock Alerts',
        value: '--',
        meta: 'Waiting for sync',
      },
      {
        icon: 'receipt-outline' as const,
        label: 'Pending RFPs',
        value: '--',
        meta: 'Waiting for sync',
      },
      {
        icon: 'layers-outline' as const,
        label: 'Requisitions',
        value: '--',
        meta: 'Waiting for sync',
      },
      {
        icon: 'card-outline' as const,
        label: 'Payment Routes',
        value: '--',
        meta: 'Waiting for sync',
      },
    ];
  }

  return [
    {
      icon: 'people-outline' as const,
      label: 'Active Users',
      value: String(summary.users.active),
      meta: `${summary.users.total} total users`,
    },
    {
      icon: 'cube-outline' as const,
      label: 'Active Products',
      value: String(summary.products.active),
      meta: `${summary.products.total} total products`,
    },
    {
      icon: 'pricetag-outline' as const,
      label: 'Low Stock Alerts',
      value: String(summary.inventoryLowStock.total),
      meta: `${summary.categories.active} active categories`,
    },
    {
      icon: 'receipt-outline' as const,
      label: 'Pending RFPs',
      value: String(summary.inventoryDraftRequests.total + summary.inventorySubmittedRequests.total),
      meta: `${summary.inventorySubmittedRequests.total} submitted`,
    },
    {
      icon: 'layers-outline' as const,
      label: 'Requisitions',
      value: String(summary.inventoryRequisitions.total),
      meta: `${summary.purchasePricelists.active} active suppliers`,
    },
    {
      icon: 'card-outline' as const,
      label: 'Payment Routes',
      value: String(summary.paymentRoutingRules.active),
      meta: `${summary.paymentMethods.active} active methods`,
    },
  ];
}
