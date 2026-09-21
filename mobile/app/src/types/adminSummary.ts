export interface SummaryCount {
  total: number;
  active: number;
}

export interface InventoryLowStockSummary {
  total: number;
}

export interface InventoryDocumentPreview {
  id: number;
  document_number: string;
  document_type: string;
  document_type_display: string;
  status: string;
  status_display: string;
  supplier_name: string;
  purchase_pricelist_supplier: string;
  created_at: string;
}

export interface InventoryDocumentSummary {
  total: number;
  results: InventoryDocumentPreview[];
}

export interface AdminSummary {
  users: SummaryCount;
  roles: SummaryCount;
  servicePoints: SummaryCount;
  products: SummaryCount;
  categories: SummaryCount;
  salesPricelists: SummaryCount;
  purchasePricelists: SummaryCount;
  rooms: SummaryCount;
  taxConfigurations: SummaryCount;
  taxCategories: SummaryCount;
  taxOffices: SummaryCount;
  discounts: SummaryCount;
  organizations: SummaryCount;
  branches: SummaryCount;
  paymentMethods: SummaryCount;
  bankAccounts: SummaryCount;
  paymentRoutingRules: SummaryCount;
  inventoryLowStock: InventoryLowStockSummary;
  inventoryDraftRequests: InventoryDocumentSummary;
  inventorySubmittedRequests: InventoryDocumentSummary;
  inventoryRequisitions: InventoryDocumentSummary;
}
