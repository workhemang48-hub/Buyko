import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../api/orders';
import { generateInvoicePDF } from '../utils/generateInvoice';

const statusColors = {
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

  const STEPS = ['processing', 'shipped', 'delivered'];

const stepLabels = {
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};
export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError('Order not found.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);
 
  if (loading) {
    return <p className="text-buyko-text-dim text-center py-16">Loading order...</p>;
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-buyko-text-dim mb-4">{error || 'Order not found.'}</p>
        <Link to="/orders" className="text-orange-400 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'cancelled';
  const currentStepIndex = STEPS.indexOf(order.orderStatus);
  const cancelledEntry = order.statusHistory?.find((e) => e.status === 'cancelled');

  const getEntryFor = (stepKey) =>
    order.statusHistory?.find((e) => e.status === stepKey);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/orders" className="text-sm text-orange-400 hover:underline mb-6 inline-block">
        ← Back to orders
      </Link>

      <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-semibold text-buyko-text">Order details</h1>
      <div className="flex items-center gap-3">
       <button
        onClick={() => generateInvoicePDF(order)}
        className="text-xs font-medium px-3 py-1.5 rounded-md border border-orange-400/30 text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 hover:border-orange-400/50 transition"
      >
        Download invoice
      </button>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-md capitalize ${statusColors[order.orderStatus]}`}>
          {order.orderStatus}
        </span>
      </div>
    </div>
    <div className="border border-white/10 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-buyko-text mb-5">Order status</h2>

        {isCancelled && cancelledEntry && (
          <div className="mb-5 text-sm text-rose-400 bg-rose-400/10 rounded-md px-3 py-2">
            Order cancelled on {formatDateTime(cancelledEntry.changedAt)}
          </div>
        )}

        <div className="flex items-start">
          {STEPS.map((step, index) => {
            const entry = getEntryFor(step);
            const isDone = !isCancelled && index <= currentStepIndex;

            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border ${
                      isDone
                        ? 'bg-orange-400 border-orange-400 text-white'
                        : 'border-white/20 text-buyko-text-dim'
                    }`}
                  >
                    {isDone ? '✓' : index + 1}
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      isDone ? 'text-buyko-text' : 'text-buyko-text-dim'
                    }`}
                  >
                    {stepLabels[step]}
                  </p>
                  <p className="text-[11px] text-buyko-text-dim mt-0.5">
                    {entry ? formatDateTime(entry.changedAt) : '—'}
                  </p>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 mx-2 mb-6 ${
                      isDone && index < currentStepIndex && !isCancelled
                        ? 'bg-orange-400'
                        : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-white/10 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-buyko-text mb-4">Status history</h2>
        <div className="space-y-3">
          {order.statusHistory?.map((entry, index) => (
            <div key={entry._id || index} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-buyko-text capitalize">{entry.status}</p>
                <p className="text-xs text-buyko-text-dim">{formatDateTime(entry.changedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-white/10 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-buyko-text mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
              />
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

      <div className="border border-white/10 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-buyko-text mb-3">Bill</h2>
        <div className="space-y-2">
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
      </div>

      <div className="border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-medium text-buyko-text mb-3">Shipping address</h2>
        <p className="text-sm text-buyko-text">{order.shippingAddress.fullName}</p>
        <p className="text-sm text-buyko-text-dim">
          {order.shippingAddress.addressLine1}
          {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}, {order.shippingAddress.country}
        </p>
        <p className="text-sm text-buyko-text-dim mt-1">{order.shippingAddress.phone}</p>
      </div>
    </div>
  );
}