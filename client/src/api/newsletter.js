import api from './axios';

export const subscribeToNewsletter = async (email) => {
  const response = await api.post('/newsletter', { email });
  return response.data;
};
export const getSubscribers = async () => {
  const response = await api.get('/newsletter');
  return response.data;
};