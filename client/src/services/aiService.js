import api from './api';

export const aiService = {
  getStatus: () => api.get('/ai/status'),
  analyzeLead: (id) => api.post(`/ai/leads/${id}/analyze`),
  generateFollowUpEmail: (id) => api.post(`/ai/leads/${id}/follow-up-email`),
  chat: (message) => api.post('/ai/chat', { message }),
};
