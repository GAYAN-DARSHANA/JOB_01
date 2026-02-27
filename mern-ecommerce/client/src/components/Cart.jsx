import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, clearCart, addToCart } from '../features/cart/cartSlice';

function Cart() {
  const { items, totalQuantity, totalAmount } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything yet.</p>
          <Link to="/" className="btn-primary inline-block">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="text-3xl font-bold mb-8">Shopping Cart ({totalQuantity} items)</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item._id} className="card p-6 flex gap-6">
                <img 
                  src={item.image || 'https://placehold.co/150x150'} 
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{item.category}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button 
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => dispatch(addToCart(item))}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => dispatch(removeFromCart(item._id))}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">${item.price} each</p>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => dispatch(clearCart())}
              className="text-red-500 hover:text-red-700 font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalQuantity} items)</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {user ? (
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary mb-4"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">Please login to checkout</p>
                  <Link to="/login" className="w-full btn-primary block text-center">
                    Login to Continue
                  </Link>
                </div>
              )}
              
              <Link to="/" className="w-full btn-secondary block text-center mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;