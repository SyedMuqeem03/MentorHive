import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * A wrapper component for routes that require specific user roles
 * Redirects to appropriate dashboard if user has a different role
 */
function RoleRoute({ requiredRole, children }) {
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
  
  // Redirect to appropriate dashboard if role doesn't match
  if (currentUser.role !== requiredRole) {
    if (currentUser.role === 'student') {
      return <Navigate to="/student-home" />;
    } else if (currentUser.role === 'mentor') {
      return <Navigate to="/mentor-home" />;
    } else {
      return <Navigate to="/" />;
    }
  }
  
  // Render the protected component if authenticated with correct role
  return children;
}

export default RoleRoute;