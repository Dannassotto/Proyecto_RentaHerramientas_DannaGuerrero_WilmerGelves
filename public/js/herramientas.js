const API_BASE = 'http://localhost:8080/api/herramienta';
const RESERVA_API = 'http://localhost:8080/api/reserva/save';

// --- Referencias a los elementos del DOM ---
const searchInput = document.getElementById('search-tools');
const toolCardsContainer = document.getElementById('tool-cards');
const recargarBtn = document.getElementById('recargar-btn');

// --- Función para obtener y validar token ---
function getToken() {
    let token = localStorage.getItem('token');

    if (!token) {
        console.error('No hay token en localStorage');
        alert('Debes iniciar sesión para ver las herramientas.');
        return null;
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    const partes = token.split('.');
    if (partes.length !== 3) {
        alert('Token inválido.');
        localStorage.removeItem('token');
        return null;
    }

    try {
        const payload = JSON.parse(atob(partes[1]));
        const ahora = Date.now();

        if (payload.exp * 1000 < ahora) {
            alert('Tu sesión ha expirado.');
            localStorage.removeItem('token');
            return null;
        }

        const authorities = payload.authorities || [];
        let authoritiesList = [];

        if (typeof authorities === 'string') {
            authoritiesList = authorities.split(',').map(auth => auth.trim());
        } else if (Array.isArray(authorities)) {
            authoritiesList = authorities;
        }

        const esCliente = authoritiesList.includes('CLIENTE') ||
            authoritiesList.includes('ROLE_CLIENTE') ||
            authoritiesList.some(auth => auth.toUpperCase().includes('CLIENTE')) ||
            (typeof authorities === 'string' && authorities.toUpperCase().includes('CLIENTE'));

        if (!esCliente) {
            alert('No tienes permisos de cliente para ver las herramientas.');
            return null;
        }

    } catch (e) {
        alert('Token inválido.');
        localStorage.removeItem('token');
        return null;
    }

    return token;
}

// --- Función para obtener el id del cliente desde localStorage ---
function getClienteId() {
    const clienteId = localStorage.getItem('clienteId');
    return clienteId ? parseInt(clienteId) : null;
}

// --- Función para pedir fechas al usuario ---
async function pedirFechasReserva() {
    let fechaInicio = prompt("Ingrese la fecha de inicio de la reserva (YYYY-MM-DD):");
    if (!fechaInicio) return null;
    let fechaFin = prompt("Ingrese la fecha de fin de la reserva (YYYY-MM-DD):");
    if (!fechaFin) return null;
    // Validación simple de formato
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) {
        alert("Formato de fecha inválido.");
        return null;
    }
    if (fechaFin < fechaInicio) {
        alert("La fecha de fin no puede ser anterior a la de inicio.");
        return null;
    }
    return { fechaInicio, fechaFin };
}

// --- Función para cargar herramientas desde la API ---
async function cargarHerramientas() {
    const token = getToken();
    if (!token) {
        toolCardsContainer.innerHTML = '<p>No se pudo validar el token. Inicia sesión para continuar.</p>';
        return;
    }

    toolCardsContainer.innerHTML = '<p>Cargando herramientas...</p>';

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(`${API_BASE}/findAll`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            const errorText = await response.text();
            alert(`Error al cargar herramientas: ${response.status} - ${errorText}`);
            toolCardsContainer.innerHTML = `<p>Error ${response.status}: ${errorText}</p>`;
            return;
        }

        const herramientas = await response.json();
        mostrarHerramientas(herramientas);

    } catch (error) {
        alert('No se pudo conectar con el servidor.');
        toolCardsContainer.innerHTML = '<p>Error de conexión con el servidor.</p>';
    }
}

// --- Función para mostrar herramientas ---
function mostrarHerramientas(herramientas) {
    toolCardsContainer.innerHTML = '';

    if (!herramientas || herramientas.length === 0) {
        toolCardsContainer.innerHTML = '<p>No se encontraron herramientas disponibles.</p>';
        return;
    }

    herramientas.forEach((herramienta, idx) => {
        const card = document.createElement('div');
        card.classList.add('tool-card');

        const nombre = herramienta.nombre || 'Sin nombre';
        const descripcion = herramienta.descripcion || 'Sin descripción';
        const precio = !isNaN(herramienta.precio) ? parseFloat(herramienta.precio).toFixed(2) : '0.00';
        const stock = herramienta.stock ?? 0;
        const imagen = herramienta.imagen?.trim() !== '' ? herramienta.imagen : '/images/default-tool.png';

        // Botón reservar con id único
        const reservarBtnId = `reservar-btn-${idx}`;

        card.innerHTML = `
      <img src="${imagen}" alt="${nombre}" onerror="this.src='/images/default-tool.png'" />
      <h3>${nombre}</h3>
      <p>${descripcion}</p>
      <p><strong>Precio:</strong> $${precio}</p>
      <p><strong>Stock:</strong> ${stock}</p>
      <button class="reservar-btn" id="${reservarBtnId}">
        <i class='bx bx-calendar-plus'></i> Reservar
      </button>
    `;

        toolCardsContainer.appendChild(card);

        // Evento para el botón de reservar
        setTimeout(() => {
            const reservarBtn = document.getElementById(reservarBtnId);
            if (reservarBtn) {
                reservarBtn.addEventListener('click', async () => {
                    const token = getToken();
                    if (!token) return;

                    const clienteId = getClienteId();
                    if (!clienteId) {
                        alert("No se pudo identificar al cliente. Por favor, inicia sesión nuevamente.");
                        return;
                    }

                    const fechas = await pedirFechasReserva();
                    if (!fechas) return;

                    // Ajusta el id del estadoReserva según tu lógica de negocio (por ejemplo, 1 = pendiente)
                    const reservaDTO = {
                        fechaInicio: fechas.fechaInicio,
                        fechaFin: fechas.fechaFin,
                        estadoReserva: { id: 1 }, // Cambia el id si tu backend usa otro valor por defecto
                        herramientaReserva: { id: herramienta.id },
                        cliente: { id: clienteId },
                        pago: null // O el objeto pago si aplica
                    };

                    try {
                        const response = await fetch(RESERVA_API, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify(reservaDTO)
                        });

                        if (response.status === 201) {
                            alert(`¡Reserva realizada para "${nombre}"!\nDel ${fechas.fechaInicio} al ${fechas.fechaFin}`);
                        } else if (response.status === 400) {
                            const errorText = await response.text();
                            alert("Datos inválidos para la reserva: " + errorText);
                        } else {
                            const errorText = await response.text();
                            alert("Error al realizar la reserva: " + errorText);
                        }
                    } catch (err) {
                        alert('Error de red al reservar la herramienta.');
                        console.error(err);
                    }
                });
            }
        }, 0);
    });
}

// --- Búsqueda dinámica ---
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const textoBusqueda = searchInput.value.trim().toLowerCase();
        const cards = document.querySelectorAll('.tool-card');

        cards.forEach(card => {
            const titulo = card.querySelector('h3')?.textContent.toLowerCase() || '';
            card.style.display = titulo.includes(textoBusqueda) ? 'block' : 'none';
        });
    });
}

// --- Recargar herramientas manualmente ---
function recargarHerramientas() {
    cargarHerramientas();
}

if (recargarBtn) {
    recargarBtn.addEventListener('click', recargarHerramientas);
}

// --- Cargar herramientas automáticamente al abrir la página ---
document.addEventListener('DOMContentLoaded', () => {
    cargarHerramientas();
});