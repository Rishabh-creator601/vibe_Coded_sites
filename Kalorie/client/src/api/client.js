// Tiny fetch wrapper that attaches the JWT and unwraps JSON / errors.

const TOKEN_KEY = 'ct_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  updateProfile: (payload) => request('/auth/me', { method: 'PATCH', body: payload }),
  getDay: (date) => request(`/entries?date=${encodeURIComponent(date)}`),
  addEntry: (payload) => request('/entries', { method: 'POST', body: payload }),
  bulkAddEntries: (payload) => request('/entries/bulk', { method: 'POST', body: payload }),
  deleteEntry: (id) => request(`/entries/${id}`, { method: 'DELETE' }),
  searchFoods: (q) => request(`/foods/search?q=${encodeURIComponent(q)}`),
  parseFoods: (line) => request('/foods/parse', { method: 'POST', body: { line } }),
  sendContact: (payload) => request('/contact', { method: 'POST', body: payload }),
};
