import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Aquí ya estamos llamando al componente real */}
        <Route path="/login" element={<Login />} />
        <Route path="/panel" element={<h2>Vista del Panel (En construcción)</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;