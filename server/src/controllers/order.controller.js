import razorpay from '../config/razorpay.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import crypto from 'crypto';

const decrementStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product not found: ${item.name}`);
    }

    const sizeEntry = product.sizes.find((s) => s.size === item.size);
    if (!sizeEntry || sizeEntry.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.name} (${item.size})`);
    }

    sizeEntry.stock -= item.quantity;
    await product.save();
  }
};

const restoreStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const sizeEntry = product.sizes.find((s) => s.size === item.size);
    if (sizeEntry) {
      sizeEntry.stock += item.quantity;
      await product.save();
    }
  }
};
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../utils/sendEmail.js';

export const createRazorpayOrder = async (req, res) => {
  try {
    const { items, shippingAddress, subtotal, gst, deliveryCharge, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    await decrementStock(items);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      subtotal,
      gst,
      deliveryCharge,
      total,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'pending',
      statusHistory: [{ status: 'processing' }],
    });

    res.status(201).json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    if (error.message.includes('Insufficient stock') || error.message.includes('Product not found')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      const failedOrder = await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
      if (failedOrder) {
        await restoreStock(failedOrder.items);
      }
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    );

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    try {
      await sendOrderConfirmationEmail(order, req.user.email);
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError.message);
    }

    res.json({ message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const wasAlreadyCancelled = order.orderStatus === 'cancelled';
    const statusChanged = order.orderStatus !== orderStatus;
    const isNewCancellation = orderStatus === 'cancelled' && !wasAlreadyCancelled;

    if (isNewCancellation && order.paymentStatus === 'paid') {
      await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(order.total * 100),
      });
      order.paymentStatus = 'refunded';
    }

    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus });
    await order.save();

    if (isNewCancellation) {
      await restoreStock(order.items);
    }

    if (statusChanged && order.user?.email && ['shipped', 'delivered', 'cancelled'].includes(orderStatus)) {
      try {
        await sendOrderStatusEmail(order, order.user.email, orderStatus);
      } catch (emailError) {
        console.error('Order status email failed:', emailError.message);
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Only paid orders can be refunded' });
    }

    await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: Math.round(order.total * 100),
    });

    order.paymentStatus = 'refunded';
    await order.save();

    if (order.user?.email) {
      try {
        await sendOrderStatusEmail(order, order.user.email, 'refunded');
      } catch (emailError) {
        console.error('Refund email failed:', emailError.message);
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'processing') {
      return res.status(400).json({ message: 'This order can no longer be cancelled' });
    }

    if (order.paymentStatus === 'paid') {
      await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(order.total * 100),
      });
      order.paymentStatus = 'refunded';
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.statusHistory.push({ status: 'cancelled' });
    await order.save();

    await restoreStock(order.items);

    try {
      await sendOrderStatusEmail(order, req.user.email, 'cancelled');
    } catch (emailError) {
      console.error('Order cancellation email failed:', emailError.message);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const createCodOrder = async (req, res) => {
  try {
    const { items, shippingAddress, subtotal, gst, deliveryCharge, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }
    if (total <= 1000) {
      return res.status(400).json({ message: 'Cash on Delivery is only available for orders above ₹1000' });
    }

    await decrementStock(items);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      subtotal,
      gst,
      deliveryCharge,
      total,
      paymentStatus: 'cod',
      statusHistory: [{ status: 'processing' }],
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    try {
      await sendOrderConfirmationEmail(order, req.user.email);
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    if (error.message.includes('Insufficient stock') || error.message.includes('Product not found')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};