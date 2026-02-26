import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchRecentOrders();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:5001/api/admin/stats',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStats(data || {});
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:5001/api/admin/orders',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRecentOrders(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-600 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>

        <div className="bg-green-600 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Products</h3>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>

        <div className="bg-purple-600 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="bg-orange-600 text-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold">
            ${(stats.totalRevenue ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <Link
            to="/admin/products"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Manage Products
          </Link>

          <Link
            to="/admin/orders"
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            View All Orders
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <h3 className="text-xl font-bold p-6 border-b">Recent Orders</h3>

        {recentOrders.map((order) => (
          <div key={order._id} className="p-6 border-b last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">
                  Order by {order.user?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : '—'}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>

            <p className="text-lg font-bold">
              ${(order.totalAmount ?? 0).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;