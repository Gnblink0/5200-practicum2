import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { currentUser } = useAuth();

  // First check if user is logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Then check if route requires specific roles and if user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    // Redirect to appropriate dashboard based on user role
    if (currentUser.role === 'Patient') {
      return <Navigate to="/patient-dashboard" />;
    } else if (currentUser.role === 'Doctor') {
      return <Navigate to="/doctor-dashboard" />;
    } else if (currentUser.role === 'Admin') {
      return <Navigate to="/admin-dashboard" />;
    } else {
      // Fallback for unknown roles
      return <Navigate to="/login" />;
    }
  }

  // If all checks pass, render the protected component
  return children;
} 