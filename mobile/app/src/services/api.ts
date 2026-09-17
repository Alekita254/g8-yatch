import { authConfig } from './authConfig';

export interface ApiConfig {
  baseUrl: string;
  timeoutMs: number;
}

export const apiConfig: ApiConfig = {
  baseUrl: authConfig.apiBaseUrl,
  timeoutMs: 15000,
};

// API calls will be implemented in service modules.
// UI components must never call fetch or axios directly.
