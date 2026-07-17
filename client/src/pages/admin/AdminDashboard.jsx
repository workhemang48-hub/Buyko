import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllOrders } from '../../api/orders';
import { getAllUsers } from '../../api/users';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, usersData] = await Promise.all([getAllOrders(), getAllUsers()]);
        setOrders(ordersData);
        setUsers(usersData);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  const filteredOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    if (fromDate && orderDate < new Date(fromDate)) return false;
    if (toDate && orderDate > new Date(`${toDate}T23:59:59`)) return false;
    return true;
  });

  const revenue = filteredOrders
    .filter((o) => o.paymentStatus === 'paid' || o.paymentStatus === 'cod')
    .reduce((sum, o) => sum + o.total, 0);
    const revenueByDay = {};
  filteredOrders.forEach((o) => {
    if (o.paymentStatus !== 'paid' && o.paymentStatus !== 'cod') return;
    const day = new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    revenueByDay[day] = (revenueByDay[day] || 0) + o.total;
  });
  const revenueChartData = Object.entries(revenueByDay).map(([day, total]) => ({ day, total }));

  const statusColors = {
    processing: '#fb923c',
    shipped: '#60a5fa',
    delivered: '#4ade80',
    cancelled: '#f87171',
  };
  const statusCounts = { processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  filteredOrders.forEach((o) => {
    statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
  });
  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  const totalOrders = filteredOrders.length;
  const totalCustomers = users.filter((u) => u.role === 'customer').length;
  const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

  const stats = [
    { label: 'Total Revenue', value: `₹${revenue.toFixed(2)}` },
    { label: 'Total Orders', value: totalOrders },
    { label: 'Total Customers', value: totalCustomers },
    { label: 'Avg Order Value', value: `₹${avgOrderValue.toFixed(2)}` },
  ];

  const productSales = {};
  filteredOrders.forEach((o) => {
    if (o.orderStatus === 'cancelled') return;
    o.items?.forEach((item) => {
      productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(productSales)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Email', 'Total', 'Payment Status', 'Order Status', 'Date'];
    const rows = filteredOrders.map((o) => [
      o._id,
      o.user?.name || '',
      o.user?.email || '',
      o.total,
      o.paymentStatus,
      o.orderStatus,
      new Date(o.createdAt).toLocaleDateString('en-IN'),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  if (loading) {
    return <p className="text-buyko-text-dim text-center py-16">Loading dashboard...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-buyko-text mb-2 text-center">Admin Dashboard</h1>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <label className="text-sm text-buyko-text-dim">
          From
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="ml-2 bg-transparent border border-white/10 rounded-md text-buyko-text text-sm px-2 py-1"
          />
        </label>
        <label className="text-sm text-buyko-text-dim">
          To
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="ml-2 bg-transparent border border-white/10 rounded-md text-buyko-text text-sm px-2 py-1"
          />
        </label>
      {(fromDate || toDate) && (
          <button
            onClick={() => { setFromDate(''); setToDate(''); }}
            className="text-xs text-orange-400 hover:underline"
          >
            Clear
          </button>
        )}
        <button
          onClick={handleExportCSV}
          disabled={filteredOrders.length === 0}
          className="text-xs font-medium px-3 py-1.5 rounded-md border border-orange-400/30 text-orange-400 bg-orange-400/10 hover:bg-orange-400/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Export CSV
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border border-white/10 rounded-xl p-4 sm:p-6 text-center overflow-hidden"
          >
            <p className="text-lg sm:text-2xl font-semibold text-buyko-text mb-1 break-words">{stat.value}</p>
            <p className="text-xs sm:text-sm text-buyko-text-dim">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        <div className="border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-medium text-buyko-text mb-4">Revenue over time</h2>
          {revenueChartData.length === 0 ? (
            <p className="text-buyko-text-dim text-sm text-center py-10">No revenue data in this range.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                <XAxis dataKey="day" stroke="#8f8f9a" fontSize={12} />
                <YAxis stroke="#8f8f9a" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid #ffffff1a', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="total" stroke="#fb923c" strokeWidth={2} dot={{ fill: '#fb923c' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-medium text-buyko-text mb-4">Orders by status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis dataKey="status" stroke="#8f8f9a" fontSize={12} className="capitalize" />
              <YAxis stroke="#8f8f9a" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid #ffffff1a', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusChartData.map((entry) => (
                  <Cell key={entry.status} fill={statusColors[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border border-white/10 rounded-xl p-6 mt-4">
        <h2 className="text-sm font-medium text-buyko-text mb-4">Top selling products</h2>
        {topProducts.length === 0 ? (
          <p className="text-buyko-text-dim text-sm text-center py-10">No product sales in this range.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
              <XAxis type="number" stroke="#8f8f9a" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="#8f8f9a" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid #ffffff1a', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="quantity" fill="#fb923c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}