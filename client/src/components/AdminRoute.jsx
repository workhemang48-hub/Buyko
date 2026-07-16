import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// SRS 4.6: "Admin-only routes are protected both on the frontend (route guard)
// and backend (middleware checking the JWT's role claim)." This is the
// frontend half — the backend middleware lives in server/src/middleware.
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}