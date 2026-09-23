import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 

function Dashboard() {
  const [nombreActivo, setNombreActivo] = useState('');
  const [valorCompra, setValorCompra] = useState('');
  const [categoria, setCategoria] = useState('');
  
  // NUEVO: Estado para nuestro filtro visual en el frontend
  const [fechaFiltro, setFechaFiltro] = useState('');

  const [amortizaciones, setAmortizaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const obtenerDatos = async () => {
    try {
      const response = await api.get('/activos');
      setAmortizaciones(response.data);
    } catch (error) {
      console.warn('Backend aún no disponible:', error.message);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    // Mantenemos el payload original, sin modificar el cálculo del backend
    const payload = { 
      nombre: nombreActivo, 
      valor: Number(valorCompra), 
      vidaUtil: Number(categoria)
    };

    try {
      await api.post('/activos', payload);
      setNombreActivo(''); setValorCompra(''); setCategoria('');
      await obtenerDatos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar activo. Verifica el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarReporte = async () => {
    try {
      const response = await api.get('/activos/exportar', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Activos.pdf'); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Hubo un error al intentar descargar el reporte.');
    }
  };

  // LÓGICA DE FILTRADO (100% Frontend)
  // Filtramos la tabla completa que nos manda el backend para mostrar solo hasta la fecha límite
  const amortizacionesFiltradas = amortizaciones.filter((item, index) => {
    if (!fechaFiltro) return true; // Si no hay filtro seleccionado, muestra todo
    
    const limite = new Date(fechaFiltro).getFullYear();
    // Asumimos el año base 2023 sumando el índice (como en tu imagen) o usamos el año que traiga la fecha
    const añoFila = item.fecha ? new Date(item.fecha).getFullYear() : (2023 + index);
    
    return añoFila <= limite;
  });
  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '40px' }}>
      <nav style={{ backgroundColor: '#0f172a', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>📊 Sistema de Activos</h1>
        <button className="btn" onClick={handleCerrarSesion} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>

      </nav>

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Tarjeta de Formulario Original */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b' }}>Registrar Nuevo Activo</h2>
          <form onSubmit={handleRegistro} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Nombre del Activo</label>
              <input className="input-modern" type="text" placeholder="Ej. Laptop MSI" value={nombreActivo} onChange={(e) => setNombreActivo(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Valor de Compra (VC) $</label>
              <input className="input-modern" type="number" placeholder="Ej. 900" value={valorCompra} onChange={(e) => setValorCompra(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Categoría / Vida Útil</label>
              <select className="input-modern" value={categoria} onChange={(e) => setCategoria(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: 'white' }}>
                <option value="">Seleccione...</option>
                <option value="3">Equipos de Cómputo (3 años)</option>
                <option value="5">Vehículos (5 años)</option>
                <option value="20">Bienes Inmuebles (20 años)</option>
              </select>
            </div>
            <button className="btn" type="submit" disabled={cargando} style={{ padding: '10px 24px', height: '42px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              {cargando ? 'Guardando...' : '➕ Registrar'}
            </button>
          </form>
        </div>

        {/* Tarjeta de Tabla */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ margin: 0, color: '#1e293b' }}>Tabla de Amortización</h2>
            
            {/* Controles de la tabla (Filtro y Descarga) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Ver hasta:</label>
                <input 
                  className="input-modern" 
                  type="date" 
                  value={fechaFiltro} 
                  onChange={(e) => setFechaFiltro(e.target.value)} 
                  style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} 
                />
              </div>

              <button className="btn" onClick={handleDescargarReporte} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📄 Descargar PDF
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 15px' }}>Fecha</th>
                  <th style={{ padding: '12px 15px' }}>Depreciación (vd)</th>
                  <th style={{ padding: '12px 15px' }}>Dep. Acumulada (vdacumulada)</th>
                  <th style={{ padding: '12px 15px' }}>Valor Real (vreal)</th>
                </tr>
              </thead>
              <tbody>
                {/* AHORA USAMOS amortizacionesFiltradas EN LUGAR DE amortizaciones */}
                {amortizacionesFiltradas.length > 0 ? (
                  amortizacionesFiltradas.map((item, index) => (
                    <tr key={index} className="table-row" style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                      <td style={{ padding: '12px 15px' }}>{item.fecha || `01/01/202${3 + index}`}</td>
                      <td style={{ padding: '12px 15px' }}>${item.depAnual || item.depreciacionAnual || item.vd || 0}</td>
                      <td style={{ padding: '12px 15px' }}>${item.depAcumulada || item.depreciacionAcumulada || item.vdacumulada || 0}</td>
                      <td style={{ padding: '12px 15px', fontWeight: 'bold', color: '#0f172a' }}>${item.valorLibros || item.valorEnLibros || item.vreal || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      {amortizaciones.length > 0 ? '📭 Ningún registro coincide con esa fecha.' : '📭 Aún no hay datos. Registra un activo o conecta el servidor.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;