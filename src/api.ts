const API_BASE = import.meta.env.VITE_API_URL || '';

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}/api${path}`;
  const response = await fetch(url, { 
    credentials: 'include', 
    ...options, 
    headers: { 
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), 
      ...options.headers 
    } 
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = body.error || (response.status === 500 ? 'Backend server error or service unavailable.' : `Request failed (${response.status}).`);
    throw Object.assign(new Error(errorMsg), { status: response.status });
  }
  return body;
}

export const post = (path: string, body: any = {}) => api(path, { method: 'POST', body: JSON.stringify(body) });
