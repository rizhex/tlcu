import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role } = useAuth();
  
  // Si no requiere autenticación específica
  if (allowedRoles.length === 0) {
    return isAuthenticated ? children : <Navigate to="/login" />;
  }
  
  // Si el rol del usuario está permitido
  if (allowedRoles.includes(role)) {
    return children;
  }
  
  // Si no tiene permiso
  return <Navigate to="/search" />;
}