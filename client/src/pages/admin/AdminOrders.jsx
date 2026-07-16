import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import AdminOrderModal from '../../components/admin/AdminOrderModal';

const orderStatusOptions = ['processing', 'shipped', 'delivered', 'cancelled'];

const paymentStatusLabels = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
  cod: 'COD',
};

const statusBadgeColors = {
  processing: 'text-orange-400 bg-orange-400/10',
  shipped: 'text-blue-400 bg-blue-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-rose-400 bg-rose-400/10',
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function AdminOrders({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (order, newStatus) => {
    try {
      await updateOrderStatus(order._id, newStatus);
      showToast('Order status updated');
      loadOrders();
    } catch (err) {
      setError('Failed to update order status.');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const monthOptions = Array.from(
    new Set(orders.map((o) => new Date(o.createdAt).toISOString().slice(0, 7)))
  )
    .sort((a, b) => b.localeCompare(a))
    .map((key) => {
      const [year, month] = key.split('-');
      const label = new Date(year, month - 1).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      });
      return { key, label };
    });

  let filteredOrders =
    selectedMonth === 'all'
      ? orders
      : orders.filter((o) => new Date(o.createdAt).toISOString().slice(0, 7) === selectedMonth);

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filteredOrders = filteredOrders.filter(
      (o) =>
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
    );
  }

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valA, valB;
    if (sortField === 'total') {
      valA = a.total;
      valB = b.total;
    } else {
      valA = new Date(a.createdAt).getTime();
      valB = new Date(b.createdAt).getTime();
    }
    return sortDirection === 'asc' ? valA - valB : valB - valA;
  });

  const getProductSummary = (order) => {
    if (!order.items || order.items.length === 0) return '—';
    const first = order.items[0].name;
    const extra = order.items.length - 1;
    return extra > 0 ? `${first} and ${extra} more` : first;
  };

  const sortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) {
    return <p className="text-buyko-text-dim text-center py-10">Loading orders...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold text-buyko-text">Orders</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <input
            type="text"
            placeholder="Search by customer name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border border-white/10 rounded-md text-buyko-text text-sm px-3 py-1.5 w-full sm:w-64 focus:outline-none focus:border-orange-400/50"
          />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border border-white/10 rounded-md text-buyko-text text-sm px-3 py-1.5"
          >
            <option value="all" style={{ color: '#ffffff', backgroundColor: '#000000' }}>
              All time
            </option>
            {monthOptions.map((m) => (
              <option key={m.key} value={m.key} style={{ color: '#ffffff', backgroundColor: '#000000' }}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {sortedOrders.length === 0 ? (
        <p className="text-buyko-text-dim text-center py-10">
          {search.trim() ? 'No orders match your search.' : selectedMonth === 'all' ? 'No orders yet.' : 'No orders this month.'}
        </p>
      ) : (
        <>
        {/* Mobile: card layout */}
        <div className="space-y-3 md:hidden">
          {sortedOrders.map((order) => (
            <div
              key={order._id}
              onClick={() => setSelectedOrderId(order._id)}
              className="border border-white/10 rounded-xl p-4 active:bg-white/5"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-buyko-text text-sm font-medium">
                    {order.user?.name || <span className="text-buyko-text-dim italic">Deleted user</span>}
                  </p>
                  {order.user?.email && (
                    <p className="text-xs text-buyko-text-dim">{order.user.email}</p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-md capitalize flex-shrink-0 ${statusBadgeColors[order.orderStatus]}`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <p className="text-sm text-buyko-text-dim mb-2">{getProductSummary(order)}</p>

              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-buyko-text-dim">{formatDate(order.createdAt)}</span>
                <span className="text-buyko-text font-medium">₹{order.total.toFixed(2)}</span>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <select
                  value={order.orderStatus}
                  onChange={(e) => handleStatusChange(order, e.target.value)}
                  className={`w-full border border-white/10 rounded-md text-sm px-2 py-1.5 capitalize ${statusBadgeColors[order.orderStatus]}`}
                >
                  {orderStatusOptions.map((status) => (
                    <option key={status} value={status} style={{ color: '#ffffff', backgroundColor: '#000000' }}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-buyko-text-dim border-b border-white/10">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th
                  className="px-4 py-3 cursor-pointer select-none hover:text-buyko-text"
                  onClick={() => handleSort('total')}
                >
                  Total{sortIndicator('total')}
                </th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th
                  className="px-4 py-3 cursor-pointer select-none hover:text-buyko-text"
                  onClick={() => handleSort('createdAt')}
                >
                  Date{sortIndicator('createdAt')}
                </th>
                </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => setSelectedOrderId(order._id)}
                  className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-buyko-text">
                    {order.user?.name || <span className="text-buyko-text-dim italic">Deleted user</span>}
                    {order.user?.email && (
                      <div className="text-xs text-buyko-text-dim">{order.user.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-buyko-text-dim">{getProductSummary(order)}</td>
                  <td className="px-4 py-3 text-buyko-text-dim">₹{order.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-buyko-text-dim">
                    {paymentStatusLabels[order.paymentStatus]}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className={`border border-white/10 rounded-md text-sm px-2 py-1 capitalize ${statusBadgeColors[order.orderStatus]}`}
                    >
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status} style={{ color: '#ffffff', backgroundColor: '#000000' }}>
                        {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-buyko-text-dim">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {selectedOrderId && (
        <AdminOrderModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
    </div>
  );
}