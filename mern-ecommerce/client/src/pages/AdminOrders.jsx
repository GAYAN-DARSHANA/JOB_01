import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:5001/api/admin/orders',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      alert('Failed to fetch orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5001/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      await fetchOrders();
      alert('Order status updated');
    } catch (error) {
      alert('Failed to update status');
      console.error(error);
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

  if (loading) {
    return <div className="container mx-auto p-6">Loading orders...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">All Orders</h2>

      <div className="bg-white rounded-lg shadow">
        {orders.map((order) => (
          <div key={order._id} className="p-6 border-b last:border-0">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold">Order ID: {order._id}</p>
                <p className="text-sm text-gray-600">
                  Customer: {order.user?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-600">
                  Email: {order.user?.email || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Date:{' '}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : '—'}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status?.toUpperCase() || 'UNKNOWN'}
                </span>

                <p className="text-xl font-bold mt-2">
                  ${(order.totalAmount ?? 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold mb-2">Items:</h4>

              {(order.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between py-1 text-sm"
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>
                    ${((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold mb-2">Shipping Address:</h4>

              <p className="text-sm text-gray-600">
                {order.shippingAddress?.fullName || '—'}
                <br />
                {order.shippingAddress?.address || '—'}
                <br />
                {order.shippingAddress?.city || '—'},{' '}
                {order.shippingAddress?.postalCode || '—'}
                <br />
                {order.shippingAddress?.country || '—'}
                <br />
                Phone: {order.shippingAddress?.phone || '—'}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-gray-600 mr-4">
                Update Status:
              </span>

              {[
                'pending',
                'processing',
                'shipped',
                'delivered',
                'cancelled'
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(order._id, status)}
                  disabled={order.status === status}
                  className={`px-3 py-1 rounded text-sm capitalize ${
                    order.status === status
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOrders;