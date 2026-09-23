import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; 

function Dashboard() {
  const [nombreActivo, setNombreActivo] = useState('');
  const [valorCompra, setValorCompra] = useState('');
  const [categoria, setCategoria] = useState('');
  
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [amortizaciones, setAmortizaciones] = useState([]);
  const [listaActivos, setListaActivos] = useState([]); // Historial de todos los registros
  const [activoIdRegistrado, setActivoIdRegistrado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Cargar la lista de todos los activos registrados al abrir el panel
  const obtenerHistorialActivos = async () => {
    try {
      const response = await api.get('/activos');
      setListaActivos(response.data);
    } catch (error) {
      console.warn('No se pudo cargar el historial de activos:', error.message);
    }
  };

  useEffect(() => {
    obtenerHistorialActivos();
  }, []);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    const payload = { 
      nombre: nombreActivo, 
      valorCompra: Number(valorCompra), 
      categoriaId: Number(categoria),
      usuarioID: 1 
    };

    try {
      const response = await api.post('/activos/registrar', payload);
      
      setAmortizaciones(response.data.historial);
      setActivoIdRegistrado(response.data.activoId);

      setNombreActivo(''); 
      setValorCompra(''); 
      setCategoria('');

      // Recargamos la lista histórica lateral
      await obtenerHistorialActivos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar activo. Verifica el servidor.');
    } finally {
      setCargando(false);
    }
  };

  // Seleccionar un activo del historial para ver su tabla y descargar reportes
  const seleccionarActivoHistorico = async (id) => {
    try {
      const response = await api.get(`/activos/historial/${id}`);
      setAmortizaciones(response.data);
      setActivoIdRegistrado(id);
    } catch (error) {
      alert('No se pudo cargar el historial de este activo.');
    }
  };

  const handleDescargarPdf = async () => {
    if (!activoIdRegistrado) return;
    try {
      const response = await api.get(`/activos/reporte/pdf/${activoIdRegistrado}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Amortizacion_${activoIdRegistrado}.pdf`); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Hubo un error al descargar el PDF.');
    }
  };

  const handleDescargarExcel = async () => {
    if (!activoIdRegistrado) return;
    try {
      const response = await api.get(`/activos/reporte/excel/${activoIdRegistrado}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Amortizacion_${activoIdRegistrado}.xlsx`); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Hubo un error al descargar el Excel.');
    }
  };

  const añoActual = new Date().getFullYear();
  const amortizacionesFiltradas = amortizaciones.filter((item) => {
    if (!fechaFiltro) return true;
    const añoLimite = new Date(fechaFiltro).getFullYear();
    const añoFila = añoActual + (item.anio - 1);
    return añoFila <= añoLimite;
  });

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '40px' }}>
      <nav style={{ backgroundColor: '#0f172a', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>📊 Sistema de Activos</h1>
        <button className="btn" onClick={handleCerrarSesion} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
        
        {/* Columna Principal (Formulario y Tabla) */}
        <div>
          {/* Formulario */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b' }}>Registrar Nuevo Activo</h2>
            <form onSubmit={handleRegistro} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Nombre</label>
                <input className="input-modern" type="text" placeholder="Ej. Laptop MSI" value={nombreActivo} onChange={(e) => setNombreActivo(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Valor ($)</label>
                <input className="input-modern" type="number" placeholder="Ej. 900" value={valorCompra} onChange={(e) => setValorCompra(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Categoría</label>
                <select className="input-modern" value={categoria} onChange={(e) => setCategoria(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', backgroundColor: 'white' }}>
                  <option value="">Seleccione...</option>
                  <option value="1">Cómputo (3 años)</option>
                  <option value="2">Vehículos (5 años)</option>
                  <option value="3">Inmuebles (20 años)</option>
                </select>
              </div>
              <button className="btn" type="submit" disabled={cargando} style={{ padding: '10px 20px', height: '42px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {cargando ? 'Guardando...' : '➕ Registrar'}
              </button>
            </form>
          </div>

          {/* Tabla de Amortización */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h2 style={{ margin: 0, color: '#1e293b' }}>Tabla de Amortización</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <input className="input-modern" type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                <button className="btn" onClick={handleDescargarPdf} disabled={!activoIdRegistrado} style={{ padding: '8px 14px', backgroundColor: activoIdRegistrado ? '#10b981' : '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: activoIdRegistrado ? 'pointer' : 'not-allowed' }}>
                  📄 PDF
                </button>
                <button className="btn" onClick={handleDescargarExcel} disabled={!activoIdRegistrado} style={{ padding: '8px 14px', backgroundColor: activoIdRegistrado ? '#0284c7' : '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: activoIdRegistrado ? 'pointer' : 'not-allowed' }}>
                  📊 Excel
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px' }}>Año</th>
                    <th style={{ padding: '12px' }}>Dep. Anual</th>
                    <th style={{ padding: '12px' }}>Dep. Acumulada</th>
                    <th style={{ padding: '12px' }}>Valor Libros</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizacionesFiltradas.length > 0 ? (
                    amortizacionesFiltradas.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                        <td style={{ padding: '12px' }}>{item.anio ? `Año ${item.anio} (${añoActual + item.anio - 1})` : `Año ${index + 1}`}</td>
                        <td style={{ padding: '12px' }}>${item.depreciacionAnual || 0}</td>
                        <td style={{ padding: '12px' }}>${item.depreciacionAcumulada || 0}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>${item.valorEnLibros || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        📭 Selecciona un activo del historial o registra uno nuevo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Columna Lateral: Historial de todos los registros */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e293b', fontSize: '1.1rem' }}>📜 Historial de Activos</h3>
          {listaActivos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
              {listaActivos.map((activo) => (
                <div 
                  key={activo.id} 
                  onClick={() => seleccionarActivoHistorico(activo.id)}
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    backgroundColor: activoIdRegistrado === activo.id ? '#eff6ff' : '#f8fafc', 
                    border: activoIdRegistrado === activo.id ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.95rem' }}>{activo.nombre}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Valor: ${activo.valorCompra}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>No hay registros previos.</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;