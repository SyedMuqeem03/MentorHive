import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * A wrapper component for routes that require authentication
 * Redirects to login page if user is not authenticated
 */
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Render the protected component if authenticated
  return children;
}

export default PrivateRoute;