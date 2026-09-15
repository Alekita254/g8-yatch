export type PilotFlowStep =
  | 'Login'
  | 'Service Point'
  | 'Products'
  | 'Cart'
  | 'Order'
  | 'Payment'
  | 'Receipt'
  | 'Print'
  | 'Sync';

export interface PilotStatus {
  isOnline: boolean;
  isSyncReady: boolean;
  message: string;
}
