export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, { credentials: 'same-origin', ...options, headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = body.error || (response.status === 500 ? 'Backend server is not running on port 3001. Please run "npm run dev:api" in another terminal.' : `Request failed (${response.status}).`);
    throw Object.assign(new Error(errorMsg), { status: response.status });
  }
  return body;
}
export const post = (path: string, body: any = {}) => api(path, { method: 'POST', body: JSON.stringify(body) });
