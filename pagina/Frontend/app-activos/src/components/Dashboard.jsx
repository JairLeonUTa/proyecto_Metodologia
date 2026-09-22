import { useState, useEffect } from 'react';
import axios from 'axios';

// URL base del backend (usa variable de entorno o puerto 5000 por defecto)
const API_URL = import.meta.env.VITE_ACTIVOS_API || 'http://localhost:5000/api';

function Dashboard() {
  const [nombreActivo, setNombreActivo] = useState('');
  const [valorCompra, setValorCompra] = useState('');
  const [categoria, setCategoria] = useState('');
  const [amortizaciones, setAmortizaciones] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Función para obtener la lista calculada de amortizaciones (GET)
  const obtenerDatos = async () => {
    try {
      const response = await axios.get(`${API_URL}/activos`);
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
      await axios.post(`${API_URL}/activos`, payload);
      // Limpiar formulario y refrescar la tabla con la respuesta del servidor
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

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Panel de Control - Registro de Activos</h2>

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

      {/* Tabla Dinámica */}
      <h3>Tabla de Amortización</h3>
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