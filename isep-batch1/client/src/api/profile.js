import axios from './axios';

export const getProfile = async (userId) => {
  const response = await axios.get(`/profile/${userId}`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axios.put('/profile', profileData);
  return response.data;
};

export const getMembers = async () => {
  const response = await axios.get('/profile');
  return response.data;
};

export const getProjects = async (userId) => {
  const response = await axios.get(`/projects/user/${userId}`);
  return response.data;
};

export const getCertificates = async (userId) => {
  const response = await axios.get(`/certificates/user/${userId}`);
  return response.data;
};

export const getAchievements = async (userId) => {
  const response = await axios.get(`/achievements/user/${userId}`);
  return response.data;
};