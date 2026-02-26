import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearCart } from '../features/cart/cartSlice';

function Checkout() {
  const { items, totalAmount } = useSelector(state => state.cart);
  const { user, token } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: items.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount,
        shippingAddress
      };

      await axios.post(
        'http://localhost:5001/api/orders',
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      dispatch(clearCart());
      
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-green-100 text-green-700 p-8 rounded-lg max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
          <p className="mb-4">Thank you for your order. You will pay cash on delivery.</p>
          <p className="text-sm">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Checkout - Cash on Delivery</h2>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="font-bold mb-4 text-lg">Order Summary</h3>
        {items.map(item => (
          <div key={item._id} className="flex justify-between py-2 border-b">
            <span>{item.name} x {item.quantity}</span>
            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 text-xl font-bold">
          <span>Total Amount:</span>
          <span className="text-green-600">${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold mb-4 text-lg">Shipping Details</h3>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={shippingAddress.fullName}
              onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={shippingAddress.address}
            onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              value={shippingAddress.postalCode}
              onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded mb-6">
          <h4 className="font-bold text-yellow-800 mb-2">Payment Method: Cash on Delivery</h4>
          <p className="text-sm text-yellow-700">You will pay ${totalAmount.toFixed(2)} when your order is delivered.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Placing Order...' : `Place Order - Pay $${totalAmount.toFixed(2)} on Delivery`}
        </button>
      </form>
    </div>
  );
}

export default Checkout;