import { HealthResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

class ApiClient {
  private base: string;

  constructor(baseUrl: string) {
    this.base = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.base}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          errData = { message: `HTTP ${response.status} ${response.statusText}` };
        }
        throw new Error(errData?.error?.message || errData?.message || 'API request failed');
      }

      return await response.json();
    } catch (err: any) {
      console.error(`[API Error] ${endpoint}:`, err);
      throw err;
    }
  }

  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }
}

export const api = new ApiClient(API_BASE);

