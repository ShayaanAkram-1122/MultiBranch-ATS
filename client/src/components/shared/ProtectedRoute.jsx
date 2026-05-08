import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

/**
 * Wraps a route that requires authentication.
 * @param {string} role - 'admin' | 'applicant' | undefined (any authenticated user)
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Redirect to correct dashboard if role mismatch
    const fallback = user.role === 'admin' ? '/admin/dashboard' : '/applicant/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
