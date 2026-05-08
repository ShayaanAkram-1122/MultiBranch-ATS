import api from './api';

export const interviewService = {
  schedule: (data)     => api.post('/interviews', data),
  getAll:   (params)   => api.get('/interviews', { params }),
  update:   (id, data) => api.put(`/interviews/${id}`, data),
  remove:   (id)       => api.delete(`/interviews/${id}`),
};

export const branchService = {
  getAll: ()           => api.get('/branches'),
  create: (data)       => api.post('/branches', data),
  update: (id, data)   => api.put(`/branches/${id}`, data),
  remove: (id)         => api.delete(`/branches/${id}`),
};

export const emailService = {
  send: (data) => api.post('/email/send', data),
};
