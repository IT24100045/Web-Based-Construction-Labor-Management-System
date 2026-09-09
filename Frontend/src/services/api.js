// API Client Service for TiDB Cloud Backend

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const laborersApi = {
  getAll: () => fetch(`${API_BASE}/laborers`).then(handleResponse),
  create: (data) =>
    fetch(`${API_BASE}/laborers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  update: (id, data) =>
    fetch(`${API_BASE}/laborers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  delete: (id) =>
    fetch(`${API_BASE}/laborers/${id}`, {
      method: 'DELETE'
    }).then(handleResponse)
};

export const sitesApi = {
  getAll: () => fetch(`${API_BASE}/sites`).then(handleResponse),
  create: (data) =>
    fetch(`${API_BASE}/sites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  update: (id, data) =>
    fetch(`${API_BASE}/sites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  delete: (id) =>
    fetch(`${API_BASE}/sites/${id}`, {
      method: 'DELETE'
    }).then(handleResponse),
  allocate: (siteId, laborerIds) =>
    fetch(`${API_BASE}/sites/${siteId}/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ laborerIds })
    }).then(handleResponse)
};

export const attendanceApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/attendance?${query}` : `${API_BASE}/attendance`;
    return fetch(url).then(handleResponse);
  },
  record: (records) =>
    fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(records)
    }).then(handleResponse),
  update: (id, data) =>
    fetch(`${API_BASE}/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  delete: (id) =>
    fetch(`${API_BASE}/attendance/${id}`, {
      method: 'DELETE'
    }).then(handleResponse)
};

export const paymentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/payments?${query}` : `${API_BASE}/payments`;
    return fetch(url).then(handleResponse);
  },
  record: (data) =>
    fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse)
};

export const authApi = {
  login: (credentials) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(handleResponse)
};

export const usersApi = {
  getAll: () => fetch(`${API_BASE}/users`).then(handleResponse),
  create: (data) =>
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  update: (id, data) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  delete: (id) =>
    fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE'
    }).then(handleResponse)
};
