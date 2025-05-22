// admin-incidencias.js
document.addEventListener('DOMContentLoaded', () => {
  const incidenciaForm = document.getElementById('incidenciaForm');
  const incidenciasTableBody = document.getElementById('incidenciasTableBody');
  const notificaciones = document.getElementById('notificaciones');

  // Función para mostrar notificaciones
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    notificaciones.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  // Función para cargar incidencias desde API
  async function cargarIncidencias() {
    try {
      const res = await fetch('/api/incidencias');
      if (!res.ok) throw new Error('Error al cargar incidencias');
      const datos = await res.json();

      incidenciasTableBody.innerHTML = '';
      datos.forEach((incidencia) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${incidencia.id}</td>
          <td>${incidencia.descripcion}</td>
          <td>${incidencia.fecha_reporte}</td>
          <td>${incidencia.id_herramienta}</td>
          <td>${incidencia.id_proveedor}</td>
          <td>${incidencia.id_tipo_reporte}</td>
        `;
        incidenciasTableBody.appendChild(tr);
      });
    } catch (error) {
      showToast(error.message);
    }
  }

  // Función para guardar incidencia
  incidenciaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      descripcion: document.getElementById('descripcion').value.trim(),
      fecha_reporte: document.getElementById('fecha_reporte').value,
      id_herramienta: Number(document.getElementById('id_herramienta').value),
      id_proveedor: Number(document.getElementById('id_proveedor').value),
      id_tipo_reporte: Number(document.getElementById('id_tipo_reporte').value),
    };

    try {
      const res = await fetch('/api/incidencias', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al guardar incidencia');

      showToast('Incidencia registrada exitosamente');
      incidenciaForm.reset();
      cargarIncidencias();
    } catch (error) {
      showToast(error.message);
    }
  });

  cargarIncidencias();
});
