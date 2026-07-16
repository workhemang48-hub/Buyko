import { useState, useEffect } from 'react';
import { getOrderByIdAdmin } from '../../api/orders';

const statusBadgeColors = {
  processing: 'text-orange-400 bg-orange-400/10',
  shipped: 'text-blue-400 bg-blue-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-rose-400 bg-rose-400/10',
};

const paymentStatusLabels = {
  pending: 'Payment pending',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
  cod: 'Cash on Delivery',
};

const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function AdminOrderModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    setError('');
    getOrderByIdAdmin(orderId)
      .then(setOrder)
      .catch(() => setError('Could not load order.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-gray-800 to-black border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        {loading ? (
          <p className="text-buyko-text-dim text-center py-10">Loading order...</p>
        ) : error || !order ? (
          <p className="text-rose-400 text-center py-10">{error || 'Order not found.'}</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-buyko-text">Order details</h2>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-md capitalize ${statusBadgeColors[order.orderStatus]}`}>
                {order.orderStatus}
              </span>
            </div>

            <div className="mb-5">
              <p className="text-xs text-buyko-text-dim mb-1">Customer</p>
              <p className="text-sm text-buyko-text">
                {order.user?.name || <span className="italic">Deleted user</span>}
              </p>
              {order.user?.email && (
                <p className="text-xs text-buyko-text-dim">{order.user.email}</p>
              )}
            </div>

            <div className="border border-white/10 rounded-xl p-4 mb-4">
              <p className="text-xs text-buyko-text-dim mb-3">Items</p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-buyko-text">{item.name}</p>
                      <p className="text-xs text-buyko-text-dim">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm text-buyko-text-dim">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/10 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm text-buyko-text-dim">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-buyko-text-dim">
                <span>GST</span>
                <span>₹{order.gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-buyko-text-dim">
                <span>Delivery</span>
                <span>{order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base text-buyko-text font-semibold pt-2 border-t border-white/10">
                <span>Total</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-buyko-text-dim pt-1">{paymentStatusLabels[order.paymentStatus]}</p>
            </div>

            <div className="border border-white/10 rounded-xl p-4 mb-4">
              <p className="text-xs text-buyko-text-dim mb-2">Shipping address</p>
              <p className="text-sm text-buyko-text">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-buyko-text-dim">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}, {order.shippingAddress.country}
              </p>
              <p className="text-sm text-buyko-text-dim mt-1">{order.shippingAddress.phone}</p>
            </div>

            <div className="border border-white/10 rounded-xl p-4">
              <p className="text-xs text-buyko-text-dim mb-3">Status history</p>
              <div className="space-y-2">
                {order.statusHistory?.map((entry, index) => (
                  <div key={entry._id || index} className="flex items-center justify-between">
                    <span className="text-sm text-buyko-text capitalize">{entry.status}</span>
                    <span className="text-xs text-buyko-text-dim">{formatDateTime(entry.changedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}