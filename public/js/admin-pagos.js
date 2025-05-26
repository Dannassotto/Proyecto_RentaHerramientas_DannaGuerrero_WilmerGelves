document.addEventListener('DOMContentLoaded', () => {
  cargarPagos();

  const pagoForm = document.getElementById('pagoForm');
  pagoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await registrarPago();
  });
});

function getToken() {
  return localStorage.getItem('token');
}

async function cargarPagos() {
  const token = getToken();
  console.log('Token usado para cargar pagos:', token);

  try {
    const response = await fetch('http://localhost:8080/api/pago/findAll', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Respuesta del servidor:', response);

    if (!response.ok) {
      let errorText = await response.text();
      console.error('Detalle del error:', errorText);
      throw new Error("Error al cargar los pagos.");
    }

    const pagos = await response.json();
    mostrarPagosEnTabla(pagos);

  } catch (error) {
    console.error("Error cargando pagos:", error);
    mostrarNotificacion("Error al cargar los pagos", "error");
  }
}

function mostrarPagosEnTabla(pagos) {
  const tbody = document.getElementById('pagosTableBody');
  tbody.innerHTML = ''; // Limpiar tabla

  pagos.forEach((pago) => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${pago.id}</td>
      <td>${pago.cliente}</td>
      <td>$${pago.monto.toFixed(2)}</td>
      <td>${pago.fecha}</td>
      <td>${pago.estado}</td>
      <td>
        <button onclick="eliminarPago(${pago.id})" class="btn-delete"><i class='bx bx-trash'></i></button>
      </td>
    `;

    tbody.appendChild(fila);
  });
}

async function registrarPago() {
  const token = getToken();

  const cliente = document.getElementById('cliente').value.trim();
  const monto = parseFloat(document.getElementById('monto').value);
  const fecha = document.getElementById('fecha').value;
  const estado = document.getElementById('estado').value;

  if (!cliente || !monto || !fecha || !estado) {
    mostrarNotificacion("Todos los campos son obligatorios", "error");
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/api/pago/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ cliente, monto, fecha, estado })
    });

    if (!response.ok) {
      throw new Error("Error al registrar el pago.");
    }

    mostrarNotificacion("Pago registrado exitosamente", "success");
    document.getElementById('pagoForm').reset();
    cargarPagos();

  } catch (error) {
    console.error("Error al registrar el pago:", error);
    mostrarNotificacion("No se pudo registrar el pago", "error");
  }
}

function mostrarNotificacion(mensaje, tipo) {
  const contenedor = document.getElementById("notificaciones");
  const noti = document.createElement("div");
  noti.className = `toast ${tipo}`;
  noti.innerText = mensaje;

  contenedor.appendChild(noti);
  setTimeout(() => contenedor.removeChild(noti), 3000);
}

async function eliminarPago(id) {
  const token = getToken();

  if (!confirm("¿Estás seguro de eliminar este pago?")) return;

  try {
    const response = await fetch(`http://localhost:8080/api/pago/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("No se pudo eliminar el pago.");
    }

    mostrarNotificacion("Pago eliminado", "success");
    cargarPagos();

  } catch (error) {
    console.error("Error eliminando pago:", error);
    mostrarNotificacion("Error al eliminar el pago", "error");
  }
}
