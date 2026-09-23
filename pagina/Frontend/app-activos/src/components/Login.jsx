import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Usamos axios normal para que no pida token al hacer login

function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos errores previos

    if (usuario.trim() && password.trim()) {
      try {
        // Llamamos al microservicio de Autenticación (Puerto 5001) usando la variable del .env
        const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:5001/api';
        
        // Hacemos la petición real al backend de tu compañero
        const response = await axios.post(`${AUTH_URL}/login`, {
          usuario: usuario,
          password: password
        });

        // Si las credenciales son correctas, el backend nos devuelve el token real
        const tokenReal = response.data.token; // (Asegúrate de que tu compañero lo envíe en un campo llamado 'token')
        
        if (tokenReal) {
          localStorage.setItem('token', tokenReal);
          navigate('/panel');
        }
      } catch (err) {
        console.error('Error de login:', err);
        setError('Credenciales incorrectas o el servidor de autenticación está apagado.');
      }
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Iniciar Sesión</h2>
      
      {/* Mostramos mensaje de error si falla el login */}
      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ textAlign: 'left' }}>
          <label>Usuario:</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ textAlign: 'left' }}>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Ingresar
        </button>
      </form>
    </div>
  );
}

export default Login;