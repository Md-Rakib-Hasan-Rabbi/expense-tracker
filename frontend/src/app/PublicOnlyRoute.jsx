import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { LoadingScreen } from '../components/common/LoadingScreen';

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen label="Checking session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
