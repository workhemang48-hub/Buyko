import api from './axios';

export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId, size, quantity = 1) => {
  const response = await api.post('/cart', { productId, size, quantity });
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/${itemId}`, { quantity });
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/cart/${itemId}`);
  return response.data;
};
