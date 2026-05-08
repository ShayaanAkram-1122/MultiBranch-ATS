import api from './api';

export const applicationService = {
  apply:        (data)     => api.post('/applications', data),
  myApplications: ()       => api.get('/applications/my'),
  getAll:       (params)   => api.get('/applications', { params }),
  getById:      (id)       => api.get(`/applications/${id}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
};
