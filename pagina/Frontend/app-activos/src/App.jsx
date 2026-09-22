import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Aquí llamamos al componente real que acabas de crear */}
        <Route path="/panel" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;