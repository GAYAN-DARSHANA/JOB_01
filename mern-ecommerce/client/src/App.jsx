import { Routes, Route, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProductList from './components/ProductList';
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

function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">MERN E-Commerce</Link>
          
          <nav className="flex items-center gap-4">
            <Link to="/" className="hover:text-blue-200">Products</Link>
            <Link to="/cart" className="hover:text-blue-200">Cart</Link>
            {user && <Link to="/orders" className="hover:text-blue-200">My Orders</Link>}
            {user?.isAdmin && (
              <Link to="/admin" className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-700">
                Admin
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center gap-2">
                <span>Hello, {user.name}</span>
                <button 
                  onClick={() => dispatch(logout())}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<main><ProductList /></main>} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/admin/products" element={
          <AdminRoute><AdminProducts /></AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute><AdminOrders /></AdminRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;