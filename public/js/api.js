/* api.js — HTTP client for the REST API
   All fetch() calls live here.
   credentials:'include' sends the session
   cookie automatically on every request. */

const API_BASE = '/api';   

// GET /api/logs  (optional query string, e.g. '?category=Heating')
async function apiGetLogs(query = '') {
  const res = await fetch(`${API_BASE}/logs${query}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET /logs failed: ${res.status}`);
  return res.json();
}

// GET /api/logs/:id
async function apiGetLog(id) {
  const res = await fetch(`${API_BASE}/logs/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET /logs/${id} failed: ${res.status}`);
  return res.json();
}

// POST /api/logs
async function apiCreateLog(data) {
  const res = await fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`POST /logs failed: ${res.status}`);
  return res.json();
}

// PUT /api/logs/:id
async function apiUpdateLog(id, data) {
  const res = await fetch(`${API_BASE}/logs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`PUT /logs/${id} failed: ${res.status}`);
  return res.json();
}

// DELETE /api/logs/:id
async function apiDeleteLog(id) {
  const res = await fetch(`${API_BASE}/logs/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`DELETE /logs/${id} failed: ${res.status}`);
  return res.json();
}

// GET /api/stats
async function apiGetStats() {
  const res = await fetch(`${API_BASE}/stats`, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET /stats failed: ${res.status}`);
  return res.json();
}