import api from './axios';

export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

export const toggleWishlistItem = async (productId) => {
  const response = await api.put(`/wishlist/${productId}/toggle`);
  return response.data;
};