import api from './api';

export const jobService = {
  getAll:    (params) => api.get('/jobs', { params }),
  getById:   (id)     => api.get(`/jobs/${id}`),
  create:    (data)   => api.post('/jobs', data),
  update:    (id, data) => api.put(`/jobs/${id}`, data),
  remove:    (id)     => api.delete(`/jobs/${id}`),
};
