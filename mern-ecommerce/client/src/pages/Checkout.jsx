import { useState, useEffect } from 'react';
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
  const [zones, setZones] = useState({});
  const [selectedZone, setSelectedZone] = useState('urban');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const courierCharge = zones[selectedZone]?.charge || 50;
  const freeShipping = totalAmount >= (zones[selectedZone]?.freeShippingAbove || 500);
  const finalCourierCharge = freeShipping ? 0 : courierCharge;
  const finalAmount = totalAmount + finalCourierCharge;

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const { data } = await axios.get('http://localhost:5001/api/orders/zones');
        setZones(data);
      } catch (error) {
        console.error('Failed to fetch zones');
      }
    };
    fetchZones();
  }, []);

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
        shippingAddress: {
          fullName,
          phone,
          address,
          city,
          postalCode,
          country,
          zone: selectedZone
        }
      };

      await axios.post(
        'http://localhost:5001/api/orders',
        orderData,
        { headers: { Authorization: 'Bearer ' + token } }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Order Placed!</h2>
          <p className="text-gray-600 mb-6">Thank you for your order. You will pay cash on delivery.</p>
          <p className="text-sm text-gray-500">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="text-3xl font-bold mb-8">Checkout</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <h3 className="text-xl font-bold mb-6 pb-4 border-b">Order Summary</h3>
              {items.map(item => (
                <div key={item._id} className="flex gap-4 mb-4 pb-4 border-b last:border-0">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                    <p className="text-blue-600 font-bold">\${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>\${totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shipping ({zones[selectedZone]?.name || 'Standard'})</span>
                  {freeShipping ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    <span>\${finalCourierCharge.toFixed(2)}</span>
                  )}
                </div>
                
                {freeShipping && (
                  <p className="text-xs text-green-600">🎉 You got free shipping!</p>
                )}
                
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">\${finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <span>💵</span> Cash on Delivery
              </h4>
              <p className="text-yellow-700 text-sm">
                You will pay <strong>\${finalAmount.toFixed(2)}</strong> when your order is delivered.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold mb-6">Shipping Details</h3>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Delivery Zone</label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(zones).map(([key, zone]) => (
                    <option key={key} value={key}>
                      {zone.name} - \${zone.charge} (Free above \${zone.freeShippingAbove})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors mt-6"
              >
                {loading ? 'Placing Order...' : 'Place Order - Pay $' + finalAmount.toFixed(2) + ' on Delivery'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;