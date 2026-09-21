import { authConfig } from './authConfig';
import type { AdminSummary } from '../types/adminSummary';

function createUrl(path: string): string {
  return `${authConfig.apiBaseUrl}${path}`;
}

export async function fetchAdminSummary(accessToken: string): Promise<AdminSummary> {
  const response = await fetch(createUrl('/api/users/admin-summary/'), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin summary.');
  }

  return (await response.json()) as AdminSummary;
}
