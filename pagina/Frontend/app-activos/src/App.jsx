import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registro from './components/Registro'; // <-- Importamos el componente de Registro
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute'; // <-- Importamos el guardia

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Nueva ruta para crear usuarios */}
        <Route path="/registro" element={<Registro />} />
        
        {/* Ruta Privada: Envolvemos el Dashboard con PrivateRoute para protegerlo */}
        <Route 
          path="/panel" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;