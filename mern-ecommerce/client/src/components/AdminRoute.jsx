import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  // Not logged in → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not admin → show access denied
  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You need admin privileges to view this page.
        </p>
      </div>
    );
  }

  // Authorized
  return children;
}

export default AdminRoute;