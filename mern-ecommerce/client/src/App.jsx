import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Package, 
  LayoutDashboard,
  ChevronDown,
  Search,
  Heart
} from 'lucide-react';
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
import WriteReview from './pages/WriteReview';
import AdminReviews from './pages/AdminReviews';


function Navigation() {
  const { user, cart } = useSelector((state) => ({ 
    user: state.auth.user, 
    cart: state.cart 
  }));
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    // Check immediately on mount
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/50' 
            : 'bg-slate-900/80 backdrop-blur-md'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isScrolled 
                  ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600' 
                  : 'bg-white/20'
              }`}>
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                isScrolled 
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent' 
                  : 'text-white'
              }`}>
                ShopHub
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/') 
                    ? isScrolled 
                      ? 'text-violet-600 bg-violet-50' 
                      : 'text-white bg-white/20'
                    : isScrolled 
                      ? 'text-slate-600 hover:text-violet-600 hover:bg-violet-50' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Home
                {isActive('/') && (
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isScrolled ? 'bg-violet-600' : 'bg-white'
                  }`} />
                )}
              </Link>
              
              <Link
                to="/cart"
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  isActive('/cart') 
                    ? isScrolled 
                      ? 'text-violet-600 bg-violet-50' 
                      : 'text-white bg-white/20'
                    : isScrolled 
                      ? 'text-slate-600 hover:text-violet-600 hover:bg-violet-50' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Cart
                {cart.totalQuantity > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 bg-violet-600 text-white text-xs font-bold rounded-full">
                    {cart.totalQuantity}
                  </span>
                )}
                {isActive('/cart') && (
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isScrolled ? 'bg-violet-600' : 'bg-white'
                  }`} />
                )}
              </Link>

              {user && (
                <Link
                  to="/orders"
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    isActive('/orders') 
                      ? isScrolled 
                        ? 'text-violet-600 bg-violet-50' 
                        : 'text-white bg-white/20'
                      : isScrolled 
                        ? 'text-slate-600 hover:text-violet-600 hover:bg-violet-50' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Orders
                  {isActive('/orders') && (
                    <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      isScrolled ? 'bg-violet-600' : 'bg-white'
                    }`} />
                  )}
                </Link>
              )}

              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    isActive('/admin') 
                      ? isScrolled 
                        ? 'text-violet-600 bg-violet-50' 
                        : 'text-white bg-white/20'
                      : isScrolled 
                        ? 'text-slate-600 hover:text-violet-600 hover:bg-violet-50' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                  {isActive('/admin') && (
                    <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                      isScrolled ? 'bg-violet-600' : 'bg-white'
                    }`} />
                  )}
                </Link>
              )}
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search Button */}
              <button className={`p-2.5 rounded-xl transition-all duration-300 ${
                isScrolled 
                  ? 'hover:bg-slate-100 text-slate-600' 
                  : 'hover:bg-white/10 text-white'
              }`}>
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button className={`p-2.5 rounded-xl transition-all duration-300 ${
                isScrolled 
                  ? 'hover:bg-slate-100 text-slate-600' 
                  : 'hover:bg-white/10 text-white'
              }`}>
                <Heart className="w-5 h-5" />
              </button>

              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      isScrolled 
                        ? 'hover:bg-slate-100 text-slate-700' 
                        : 'hover:bg-white/10 text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isScrolled ? 'bg-violet-100' : 'bg-white/20'
                    }`}>
                      <User className={`w-4 h-4 ${isScrolled ? 'text-violet-600' : 'text-white'}`} />
                    </div>
                    <span className="font-medium hidden xl:block">{user.name?.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-800">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                      <Link 
                        to="/orders" 
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <button 
                        onClick={() => {
                          dispatch(logout());
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    to="/login" 
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                      isScrolled 
                        ? 'text-slate-600 hover:text-violet-600 hover:bg-violet-50' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 ${
                isScrolled 
                  ? 'hover:bg-slate-100 text-slate-700' 
                  : 'hover:bg-white/10 text-white'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white border-t border-slate-100 px-4 py-4 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive('/') ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Home
            </Link>
            <Link
              to="/cart"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive('/cart') ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Cart {cart.totalQuantity > 0 && `(${cart.totalQuantity})`}
            </Link>
            {user && (
              <Link
                to="/orders"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive('/orders') ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Package className="w-5 h-5" />
                My Orders
              </Link>
            )}
            {user?.isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive('/admin') ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Admin Dashboard
              </Link>
            )}
            
            <div className="border-t border-slate-100 pt-4 mt-4">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      dispatch(logout());
                      setIsMenuMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link 
                    to="/login" 
                    className="flex-1 text-center px-4 py-3 border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex-1 text-center px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20" />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
                  Trending Now
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                  Featured Products
                </h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                  Discover our handpicked selection of premium products at unbeatable prices
                </p>
              </div>
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
        <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
        <Route path="/" element={
  <>
    <Hero />
    <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <ProductList />
    </main>
  </>
} />
      </Routes>
      
      
      {/* Modern Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ShopHub</span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Your one-stop destination for premium products at unbeatable prices.
              </p>
              <div className="flex gap-3">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-violet-600 transition-colors"
                  >
                    <span className="text-lg">{social === 'twitter' ? '𝕏' : social[0].toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {['Home', 'Products', 'Cart', 'My Orders', 'About Us'].map((link) => (
                  <li key={link}>
                    <Link to="/" className="text-slate-400 hover:text-violet-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'FAQ'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-400 hover:text-violet-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-semibold mb-6">Newsletter</h4>
              <p className="text-slate-400 mb-4">
                Subscribe to get special offers and updates.
              </p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button className="px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 ShopHub. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-violet-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-violet-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-violet-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;