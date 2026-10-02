import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Intercept requests and attach Bearer token if present
api.interceptors.request.use((config) => {
  // The archive's legacy admin portal uses isep_admin_token; the member auth flow uses isep_token.
  const token = localStorage.getItem('isep_admin_token') || localStorage.getItem('isep_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const photosApi = {
  getAll: (album) => api.get(`/photos${album && album !== 'All' ? `?album=${encodeURIComponent(album)}` : ''}`),
  upload: (formData) => api.post('/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/photos/${id}`)
};

export const certsApi = {
  getAll: (search, category) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    return api.get(`/certificates?${params.toString()}`);
  },
  create: (data) => api.post('/certificates', data),
  delete: (id) => api.delete(`/certificates/${id}`)
};

export const achievementsApi = {
  getAll: () => api.get('/achievements'),
  create: (data) => api.post('/achievements', data),
  delete: (id) => api.delete(`/achievements/${id}`)
};

export const thoughtsApi = {
  getApproved: () => api.get('/thoughts'),
  getAllAdmin: () => api.get('/thoughts/admin/all'),
  submit: (data) => api.post('/thoughts', data),
  updateStatus: (id, status) => api.patch(`/thoughts/${id}`, { status }),
  delete: (id) => api.delete(`/thoughts/${id}`)
};
export const activitiesApi = {
  getAll: () => api.get('/activities'),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`)
};

export const membersApi = {
  getAll: () => api.get('/profile')
};

export const mockInterviewsApi = {
  getAll: () => api.get('/mock-interviews'),
  getOne: (id) => api.get(`/mock-interviews/${id}`),
  create: (data) => api.post('/mock-interviews', data),
  update: (id, data) => api.put(`/mock-interviews/${id}`, data),
  delete: (id) => api.delete(`/mock-interviews/${id}`)
};

export const hackathonsApi = {
  getAll: () => api.get('/hackathons'),
  getById: (id) => api.get(`/hackathons/${id}`),
  create: (data) => api.post('/hackathons', data),
  update: (id, data) => api.put(`/hackathons/${id}`, data),
  delete: (id) => api.delete(`/hackathons/${id}`)
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials)
};

export const memoriesApi = {
  getAll: () => api.get('/memories'),
  create: (formData) => api.post('/memories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/memories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/memories/${id}`)
};

export default api;
