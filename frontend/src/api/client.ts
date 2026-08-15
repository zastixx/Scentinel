const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface APIError extends Error {
  statusCode?: number;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = 'An unexpected error occurred';
    let statusCode = response.status;
    
    try {
      const data = await response.json();
      message = data?.error?.message || data?.message || message;
      statusCode = data?.error?.statusCode || statusCode;
    } catch {
      // Ignore JSON parse errors on non-json error pages
      message = response.statusText || message;
    }

    const error: APIError = new Error(message);
    error.statusCode = statusCode;
    throw error;
  }

  return response.json();
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(res) as Promise<T>;
  },

  async post<T>(path: string, body?: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res) as Promise<T>;
  },
};

export default api;
