import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import ProductList from './components/ProductList';
import ProductCard from './components/ProductCard';
import Hero from './components/Hero';
import Cart from './components/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminRoute from './components/AdminRoute';
import { logout } from './features/auth/authSlice';

function Navigation() {
  const { user, cart } = useSelector((state) => ({ 
    user: state.auth.user, 
    cart: state.cart 
  }));
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/cart', label: `Cart (${cart.totalQuantity})` },
    ...(user ? [{ to: '/orders', label: 'My Orders' }] : []),
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ShopHub
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-medium transition-colors ${
                  location.pathname === link.to 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l">
                <span className="text-gray-700">Hi, {user.name}</span>
                <button 
                  onClick={() => dispatch(logout())}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l">
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 text-gray-600 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <main className="container mx-auto px-6 py-12">
              <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
              <ProductList />
            </main>
          </>
        } />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      </Routes>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-2xl font-bold text-white mb-4">ShopHub</p>
          <p className="mb-4">Your one-stop shop for everything amazing.</p>
          <p className="text-sm text-gray-500">© 2024 ShopHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;