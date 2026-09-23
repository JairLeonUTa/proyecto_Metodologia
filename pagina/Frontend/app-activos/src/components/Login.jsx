import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 


function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (usuario.trim() && password.trim()) {
      try {
        const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:5001/api';
        const response = await axios.post(`${AUTH_URL}/login`, { usuario, password });
        
        const tokenReal = response.data.token; 

        if (tokenReal) {
          localStorage.setItem('token', tokenReal);
          navigate('/panel');
        }
      } catch (err) {
        console.error('Error de login:', err);
        setError('Credenciales incorrectas o servidor apagado.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#fff' }}>
      {/* Sección Izquierda: Imagen relacionada a contabilidad y activos */}
      <div style={{ 
        flex: 1, 
        backgroundImage: 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      </div>

      {/* Sección Derecha: Formulario */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#1a1a1a' }}>Bienvenido de nuevo</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>Ingresa tus credenciales para acceder al sistema de activos.</p>
          
          {error && <p style={{ color: '#d9534f', backgroundColor: '#fdf7f7', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #d9534f' }}>{error}</p>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444' }}>Usuario</label>
              <input
                className="input-modern"
                type="text"
                placeholder="Ej. administrador"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444' }}>Contraseña</label>
              <input
                className="input-modern"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem' }}
              />
            </div>
            <button className="btn" type="submit" style={{ padding: '14px', marginTop: '10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;