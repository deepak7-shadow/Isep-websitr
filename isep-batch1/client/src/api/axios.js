import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Intercept requests and attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('isep_admin_token');
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

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials)
};

export default api;
