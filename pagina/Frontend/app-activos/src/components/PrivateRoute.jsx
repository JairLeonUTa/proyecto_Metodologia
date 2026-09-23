import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  
  // Si no existe el token en el localStorage, redirige al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Si existe el token, permite ver el componente protegido
  return children;
}

export default PrivateRoute;