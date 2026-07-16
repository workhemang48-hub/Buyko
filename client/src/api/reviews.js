import api from './axios';

export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

export const getReviewEligibility = async (productId) => {
  const response = await api.get(`/reviews/eligibility/${productId}`);
  return response.data;
};

export const createReview = async (productId, rating, comment) => {
  const response = await api.post(`/reviews/${productId}`, { rating, comment });
  return response.data;
};

export const updateReview = async (productId, rating, comment) => {
  const response = await api.put(`/reviews/${productId}`, { rating, comment });
  return response.data;
};

export const deleteReview = async (productId) => {
  const response = await api.delete(`/reviews/${productId}`);
  return response.data;
};