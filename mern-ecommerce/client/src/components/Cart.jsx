import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, clearCart } from '../features/cart/cartSlice';

function Cart() {
  const { items, totalQuantity, totalAmount } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <Link to="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart ({totalQuantity} items)</h2>
      
      <div className="bg-white rounded-lg shadow">
        {items.map(item => (
          <div key={item._id} className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600">\${item.price} each</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg">\${(item.price * item.quantity).toFixed(2)}</span>
              <button 
                onClick={() => dispatch(removeFromCart(item._id))}
                className="text-red-500 hover:text-red-700 font-bold px-3 py-1 border border-red-500 rounded hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-600">Subtotal ({totalQuantity} items)</p>
              <p className="text-3xl font-bold text-gray-800">\${totalAmount.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => dispatch(clearCart())}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              Clear Cart
            </button>
          </div>
          
          {user ? (
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition"
            >
              Proceed to Checkout (Cash on Delivery)
            </button>
          ) : (
            <div className="text-center bg-yellow-50 p-4 rounded">
              <p className="text-gray-700 mb-3">Please login to complete your order</p>
              <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 inline-block font-semibold">
                Login to Continue
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;