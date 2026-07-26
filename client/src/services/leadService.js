import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const leadService = {
  create: (data) => api.post('/leads', data),
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  update: (id, data) => api.patch(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  addNote: (id, content) => api.post(`/leads/${id}/notes`, { content }),
  uploadFile: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/leads/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  export: (params, format = 'csv') =>
    api.get('/leads/export', {
      params: { ...params, format },
      responseType: 'blob',
    }),
};

export const userService = {
  getAll: () => api.get('/users'),
  getAssignees: () => api.get('/users/assignees'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
