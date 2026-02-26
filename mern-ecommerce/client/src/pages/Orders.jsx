import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(
          'http://localhost:5001/api/orders/myorders',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders');
      }
      setLoading(false);
    };

    fetchOrders();
  }, [token]);

  if (loading) return <div className="container mx-auto p-6">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
        <Link to="/" className="text-blue-600 hover:underline">Start Shopping</Link>
      </div>
    );
  }

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
    <div className="container mx-auto p-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      
      {orders.map(order => (
        <div key={order._id} className="bg-white rounded-lg shadow mb-4 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-600">Order ID: {order._id}</p>
              <p className="text-sm text-gray-600">
                Placed on: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
              {order.status.toUpperCase()}
            </span>
          </div>

          <div className="border-t pt-4 mb-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <div>
              <p className="font-bold text-lg">Total: ${order.totalAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-600">
                Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'} 
                ({order.paymentStatus})
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Ship to:</p>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;