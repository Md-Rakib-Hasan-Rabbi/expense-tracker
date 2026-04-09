import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { LoadingScreen } from '../components/common/LoadingScreen';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
