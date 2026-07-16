import api from "./axios";

export const createOrder = async (orderData) => {
  const response = await api.post("/orders/create", orderData);
  return response.data;
};

export const verifyPayment = async (verificationData) => {
  const response = await api.post("/orders/verify", verificationData);
  return response.data;
};
export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const updateOrderStatus = async (orderId, orderStatus) => {
  const response = await api.put(`/orders/${orderId}/status`, { orderStatus });
  return response.data;
};

export const refundOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/refund`);
  return response.data;
};
export const cancelOrder = async (orderId) => {
  const response = await api.put(`/orders/${orderId}/cancel`);
  return response.data;
};
export const createCodOrder = async (orderData) => {
  const response = await api.post('/orders/create-cod', orderData);
  return response.data;
};
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};
export const getOrderByIdAdmin = async (orderId) => {
  const response = await api.get(`/orders/admin/${orderId}`);
  return response.data;
};