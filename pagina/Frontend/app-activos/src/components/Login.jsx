import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Vite usa import.meta.env para acceder a las variables del archivo .env
      const apiUrl = import.meta.env.VITE_AUTH_API;
      
      const response = await axios.post(`${apiUrl}/login`, {
        usuario,
        password
      });
      
      // Se extrae el token y se guarda en localStorage
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      alert('¡Login exitoso!');
      navigate('/panel'); // Redirige al panel tras un login correcto
      
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error en el login. Asegúrate de que el backend esté encendido.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '300px', margin: '0 auto' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Usuario:</label>
          <input 
            type="text" 
            value={usuario} 
            onChange={(e) => setUsuario(e.target.value)} 
            required 
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Ingresar</button>
      </form>
    </div>
  );
}

export default Login;