
import { CONFIG } from '../config';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}

export const client = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
};
