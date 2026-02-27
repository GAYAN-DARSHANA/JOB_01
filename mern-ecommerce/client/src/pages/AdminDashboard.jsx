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
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentOrders(data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch orders');
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

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`${color} text-white p-6 rounded-2xl shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <div className="flex gap-4">
            <Link to="/admin/products" className="btn-primary bg-purple-600 hover:bg-purple-700">
              Manage Products
            </Link>
            <Link to="/admin/orders" className="btn-primary">
              All Orders
            </Link>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Orders" value={stats.totalOrders} icon="📦" color="bg-blue-600" />
          <StatCard title="Products" value={stats.totalProducts} icon="🏷️" color="bg-green-600" />
          <StatCard title="Users" value={stats.totalUsers} icon="👥" color="bg-purple-600" />
          <StatCard title="Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} icon="💰" color="bg-orange-600" />
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">Recent Orders</h3>
          </div>
          {recentOrders.map(order => (
            <div key={order._id} className="p-6 border-b last:border-0 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-semibold">{order.user?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className="font-bold text-lg">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;