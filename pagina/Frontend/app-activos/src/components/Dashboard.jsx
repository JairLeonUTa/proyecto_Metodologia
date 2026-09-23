import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Interceptor con seguridad

function Dashboard() {
  const [nombreActivo, setNombreActivo] = useState('');
  const [valorCompra, setValorCompra] = useState('');
  const [categoria, setCategoria] = useState('');
  const [amortizaciones, setAmortizaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  const navigate = useNavigate();

  // Función para cerrar sesión (elimina el token y te patea al login)
  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Función para obtener la lista calculada de amortizaciones (GET)
  const obtenerDatos = async () => {
    try {
      const response = await api.get('/activos');
      setAmortizaciones(response.data);
    } catch (error) {
      console.warn('Backend aún no disponible o sin registros:', error.message);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  // Función para enviar un nuevo activo al backend (POST)
  const handleRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);

    const payload = {
      nombre: nombreActivo,
      valor: Number(valorCompra),
      vidaUtil: Number(categoria),
    };

    try {
      await api.post('/activos', payload);
      
      setNombreActivo('');
      setValorCompra('');
      setCategoria('');
      await obtenerDatos();
    } catch (error) {
      console.error('Error al registrar activo:', error);
      alert('No se pudo enviar al backend. Verifica que el servidor de tu compañero esté en ejecución.');
    } finally {
      setCargando(false);
    }
  };

  // Función para descargar el reporte como Blob (Fase 4)
  const handleDescargarReporte = async () => {
    try {
      // Pedimos el reporte y le decimos a Axios que lo trate como un archivo (blob)
      const response = await api.get('/activos/exportar', {
        responseType: 'blob', 
      });
      
      // Magia para forzar la descarga en el navegador
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Activos.pdf'); // Puedes cambiar .pdf por .xlsx según lo que haga el backend
      document.body.appendChild(link);
      link.click();
      
      // Limpiamos el enlace temporal
      link.remove();
    } catch (error) {
      console.error('Error al descargar el reporte:', error);
      alert('Hubo un error al intentar descargar el reporte.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Panel de Control - Registro de Activos</h2>
      
      {/* Botón de Cerrar Sesión */}
      <button 
        onClick={handleCerrarSesion} 
        style={{ marginBottom: '20px', padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Cerrar Sesión
      </button>

      {/* Formulario */}
      <form onSubmit={handleRegistro} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Nombre del activo"
          value={nombreActivo}
          onChange={(e) => setNombreActivo(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Valor de compra"
          value={valorCompra}
          onChange={(e) => setValorCompra(e.target.value)}
          required
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
          <option value="">Selecciona una categoría</option>
          <option value="3">Equipos de Cómputo (3 años)</option>
          <option value="5">Vehículos (5 años)</option>
          <option value="20">Bienes Inmuebles (20 años)</option>
        </select>
        <button type="submit" disabled={cargando} style={{ cursor: 'pointer' }}>
          {cargando ? 'Registrando...' : 'Registrar'}
        </button>
      </form>

      {/* Encabezado de la tabla con botón de descarga */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Tabla de Amortización</h3>
        <button 
          onClick={handleDescargarReporte}
          style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Descargar Reporte
        </button>
      </div>

      {/* Tabla Dinámica */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th>Fecha</th>
            <th>Dep. Anual</th>
            <th>Dep. Acumulada</th>
            <th>Valor en Libros</th>
          </tr>
        </thead>
        <tbody>
          {amortizaciones.length > 0 ? (
            amortizaciones.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td>{item.fecha || `Año ${index + 1}`}</td>
                <td>${item.depAnual || item.depreciacionAnual || 0}</td>
                <td>${item.depAcumulada || item.depreciacionAcumulada || 0}</td>
                <td>${item.valorLibros || item.valorEnLibros || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>
                Esperando datos del servidor...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;