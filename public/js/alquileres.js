/**
 * JS para views/cliente/alquileres.html
 * Muestra los alquileres (reservas) del cliente autenticado.
 */

const API_RESERVAS = "http://localhost:8080/api/reserva";
const rentalsList = document.getElementById("rentals-list");

// Utilidad para obtener el token
function getToken() {
  return localStorage.getItem("token");
}

// Utilidad para obtener el id del cliente autenticado
function getClienteId() {
  const id = localStorage.getItem("clienteId");
  return id ? parseInt(id) : null;
}

// Renderiza las reservas en la tabla
function renderReservas(reservas) {
  rentalsList.innerHTML = "";
  if (!reservas || reservas.length === 0) {
    rentalsList.innerHTML = `<tr><td colspan="5">No tienes reservas registradas.</td></tr>`;
    return;
  }

  reservas.forEach(reserva => {
    const herramientaNombre = reserva.herramientaReserva?.nombre || "-";
    const fechaInicio = reserva.fechaInicio || "-";
    const fechaFin = reserva.fechaFin || "-";
    const estado = reserva.estadoReserva?.nombre || reserva.estadoReserva || "-";
    const puedeCancelar = estado === "PENDIENTE" || estado === "EN_PROCESO";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${herramientaNombre}</td>
      <td>${fechaInicio}</td>
      <td>${fechaFin}</td>
      <td>${estado}</td>
      <td>
        ${puedeCancelar ? `<button class="cancelar-btn" data-id="${reserva.id}">Cancelar</button>` : ""}
      </td>
    `;
    rentalsList.appendChild(tr);
  });

  // Listeners para cancelar
  document.querySelectorAll(".cancelar-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const reservaId = btn.getAttribute("data-id");
      if (confirm("¿Seguro que deseas cancelar esta reserva?")) {
        await cancelarReserva(reservaId);
        cargarReservas();
      }
    });
  });
}

// Carga las reservas del cliente autenticado usando el endpoint optimizado
async function cargarReservas() {
  const token = getToken();
  const clienteId = getClienteId();

  if (!token || !clienteId) {
    rentalsList.innerHTML = `<tr><td colspan="5">No se pudo identificar al cliente. Inicia sesión nuevamente.</td></tr>`;
    return;
  }

  try {
    // Usar el endpoint optimizado del backend
    const res = await fetch(`${API_RESERVAS}/findByCliente/${clienteId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Error al obtener reservas");

    const reservas = await res.json();
    renderReservas(reservas);
  } catch (err) {
    rentalsList.innerHTML = `<tr><td colspan="5">Error al cargar reservas.</td></tr>`;
    console.error(err);
  }
}

// Cancela una reserva (puedes ajustar el endpoint según tu backend)
async function cancelarReserva(reservaId) {
  const token = getToken();
  try {
    // Aquí puedes hacer un DELETE o un PUT para cambiar el estado a "CANCELADA"
    const res = await fetch(`${API_RESERVAS}/deleteById/${reservaId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
      alert("No se pudo cancelar la reserva.");
    }
  } catch (err) {
    alert("Error al cancelar la reserva.");
    console.error(err);
  }
}

// Inicializa al cargar la página
document.addEventListener("DOMContentLoaded", cargarReservas);