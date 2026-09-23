import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api'; // Usamos authApi porque apunta al puerto 5001

function Registro() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('1'); // Por defecto rol 1 (Ej. Administrador)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (usuario.trim() && password.trim()) {
      try {
        const response = await authApi.post('/auth/registrar', { 
          nombreUsuario: usuario, 
          password: password,
          rolId: Number(rol)
        });
        
        // Mensaje de éxito y redirección al login
        setMensaje({ texto: response.data.message || 'Usuario creado exitosamente.', tipo: 'exito' });
        setTimeout(() => {
          navigate('/login');
        }, 2000);

      } catch (err) {
        console.error('Error de registro:', err);
        const errorMsg = err.response?.data?.message || 'Error al conectar con el servidor.';
        setMensaje({ texto: errorMsg, tipo: 'error' });
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#fff' }}>
      {/* Sección Izquierda: Imagen */}
      <div style={{ 
        flex: 1, 
        backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      </div>

      {/* Sección Derecha: Formulario */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#1a1a1a' }}>Crear Usuario</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>Registra un nuevo usuario para el sistema de activos.</p>
          
          {mensaje.texto && (
            <p style={{ 
              color: mensaje.tipo === 'error' ? '#d9534f' : '#155724', 
              backgroundColor: mensaje.tipo === 'error' ? '#fdf7f7' : '#d4edda', 
              padding: '12px', 
              borderRadius: '6px', 
              borderLeft: `4px solid ${mensaje.tipo === 'error' ? '#d9534f' : '#28a745'}`,
              marginBottom: '20px'
            }}>
              {mensaje.texto}
            </p>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444' }}>Nuevo Usuario</label>
              <input
                className="input-modern"
                type="text"
                placeholder="Ej. juan.perez"
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444' }}>Asignar Rol</label>
              <select
                className="input-modern"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem', backgroundColor: 'white' }}
              >
                <option value="1">Administrador</option>
                <option value="2">Usuario Estándar</option>
              </select>
            </div>
            <button className="btn" type="submit" style={{ padding: '14px', marginTop: '10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Registrar Usuario
            </button>
          </form>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;