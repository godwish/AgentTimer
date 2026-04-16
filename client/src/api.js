import Cookies from 'js-cookie';

const API_BASE = '/api';

const getHeaders = () => {
  const token = Cookies.get('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  checkStatus: () => fetch(`${API_BASE}/auth/status`).then(res => res.json()),
  setupAdmin: (data) => fetch(`${API_BASE}/auth/setup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(res => res.json()),
  login: (data) => fetch(`${API_BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(res => res.json()),

  getAgents: () => fetch(`${API_BASE}/agents`, { headers: getHeaders() }).then(res => res.json()),
  createAgent: (data) => fetch(`${API_BASE}/agents`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
  }).then(res => res.json()),
  updateAgent: (id, data) => fetch(`${API_BASE}/agents/${id}`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
  }).then(res => res.json()),
  deleteAgent: (id) => fetch(`${API_BASE}/agents/${id}`, {
    method: 'DELETE', headers: getHeaders()
  }).then(res => res.json()),
  
  getDashboardList: () => fetch(`${API_BASE}/dashboard/list`, { headers: getHeaders() }).then(res => res.json()),
  
  createProfile: (data) => fetch(`${API_BASE}/profiles`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
  }).then(res => res.json()),

  startCooldown: (data) => fetch(`${API_BASE}/cooldowns/start`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
  }).then(res => res.json()),

  clearCooldown: (limit_id) => fetch(`${API_BASE}/cooldowns/clear`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify({ limit_id })
  }).then(res => res.json()),

  updateProfile: (id, data) => fetch(`${API_BASE}/profiles/${id}`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(data)
  }).then(res => res.json()),

  deleteProfile: (id) => fetch(`${API_BASE}/profiles/${id}`, {
    method: 'DELETE', headers: getHeaders()
  }).then(res => res.json()),

  updateLimitPercent: (limitId, remaining_percent) => fetch(`${API_BASE}/limits/${limitId}/percent`, {
    method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ remaining_percent })
  }).then(res => res.json()),

  exportData: () => fetch(`${API_BASE}/data/export`, { headers: getHeaders() }).then(res => res.json()),

  importData: (data) => fetch(`${API_BASE}/data/import`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(data)
  }).then(res => res.json()),
};
