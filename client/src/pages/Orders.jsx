import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders, cancelOrder } from '../api/orders';
import { Skeleton } from '../components/Skeleton';
import Spinner from '../components/Spinner';

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
};

export default function Orders({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleCancel = async (order) => {
    const confirmed = window.confirm(
      `Cancel this order? ${order.paymentStatus === 'paid' ? 'Your payment will be refunded.' : ''}`
    );
    if (!confirmed) return;

    setCancellingId(order._id);
    try {
      const updatedOrder = await cancelOrder(order._id);
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
      showToast?.('Order cancelled');
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Could not cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Skeleton className="h-9 w-56 mb-8" />
        <div className="space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-10" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center py-16">{error}</p>;
  }

  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  let visibleOrders = orders.filter((order) => {
    if (order.orderStatus !== 'cancelled' || !order.cancelledAt) return true;
    const cancelledAgo = Date.now() - new Date(order.cancelledAt).getTime();
    return cancelledAgo < TWENTY_FOUR_HOURS_MS;
  });

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-buyko-text mb-2">Order History</h1>
        <p className="text-buyko-text-dim text-sm mb-6">You haven't placed any orders yet.</p>
        <Link to="/" className="text-orange-400 hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }

  if (statusFilter !== 'all') {
    visibleOrders = visibleOrders.filter((order) => order.orderStatus === statusFilter);
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    visibleOrders = visibleOrders.filter(
      (order) =>
        order._id.toLowerCase().includes(q) ||
        order.items.some((item) => item.name.toLowerCase().includes(q))
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-buyko-text mb-8">Order History</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Search by product or order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-transparent border border-white/10 rounded-md text-buyko-text text-sm px-3 py-2 focus:outline-none focus:border-orange-400/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-transparent border border-white/10 rounded-md text-buyko-text text-sm px-3 py-2"
        >
          <option value="all" style={{ color: '#ffffff', backgroundColor: '#000000' }}>All statuses</option>
          <option value="processing" style={{ color: '#ffffff', backgroundColor: '#000000' }}>Processing</option>
          <option value="shipped" style={{ color: '#ffffff', backgroundColor: '#000000' }}>Shipped</option>
          <option value="delivered" style={{ color: '#ffffff', backgroundColor: '#000000' }}>Delivered</option>
          <option value="cancelled" style={{ color: '#ffffff', backgroundColor: '#000000' }}>Cancelled</option>
        </select>
      </div>

      {visibleOrders.length === 0 ? (
        <p className="text-buyko-text-dim text-center py-16">
          No orders match your search.
        </p>
      ) : (
      <div className="space-y-5">
        {visibleOrders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="block border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
              <div>
                <p className="text-xs text-buyko-text-dim">
                  Order placed {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-buyko-text-dim mt-0.5">{paymentStatusLabels[order.paymentStatus]}</p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-md capitalize ${statusColors[order.orderStatus]}`}
              >
                {order.orderStatus}
              </span>
            </div>

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

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
              <span className="text-sm text-buyko-text-dim">Total</span>
              <span className="text-base text-buyko-text font-semibold">₹{order.total.toFixed(2)}</span>
            </div>

            {order.orderStatus === 'processing' && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleCancel(order);
                }}
                disabled={cancellingId === order._id}
                className="text-sm text-rose-400 hover:underline disabled:opacity-40 mt-3"
              >
                {cancellingId === order._id ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Spinner size={12} /> Cancelling...
                  </span>
                ) : (
                  'Cancel order'
                )}
              </button>
            )}
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}