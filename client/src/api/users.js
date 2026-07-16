import api from './axios';

export const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const updateMyProfile = async (name, phone) => {
  const response = await api.put('/users/me', { name, phone });
  return response.data;
};
export const updateMyPassword = async (currentPassword, newPassword) => {
  const response = await api.put('/users/me/password', { currentPassword, newPassword });
  return response.data;
};

export const updateMyEmail = async (newEmail, currentPassword) => {
  const response = await api.put('/users/me/email', { newEmail, currentPassword });
  return response.data;
};
export const toggleUserRole = async (userId) => {
  const response = await api.put(`/users/${userId}/role`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};