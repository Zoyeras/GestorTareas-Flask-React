import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  // 1. Verificar si hay usuario autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Verificar rol si se especificó
  if (requiredRole && user.role !== requiredRole) {
    console.warn(`Acceso denegado. Rol requerido: ${requiredRole}`);
    return <Navigate to="/" replace />; // Redirigir a home en lugar de login
  }

  // 3. Renderizar contenido si pasa las validaciones
  return children;
};

export default PrivateRoute;
