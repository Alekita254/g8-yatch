import { authConfig } from './authConfig';
import type { AuthProfile } from '../types/auth';

function createUrl(path: string): string {
  return `${authConfig.apiBaseUrl}${path}`;
}

export async function fetchMyProfile(accessToken: string): Promise<AuthProfile> {
  const response = await fetch(createUrl('/api/users/me/'), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile.');
  }

  return (await response.json()) as AuthProfile;
}
