
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
            authoritiesList.some(auth => auth.includes('CLIENTE')) ||
            (typeof authorities === 'string' && authorities.includes('CLIENTE'));

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
                    // Aquí puedes pedir fechas al usuario, por ahora usamos hoy y hoy+3 días
                    const hoy = new Date();
                    const fechaInicio = hoy.toISOString().slice(0, 10);
                    const fechaFin = new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

                    const token = getToken();
                    if (!token) return;

                    try {
                        const response = await fetch(RESERVA_API, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                fechaInicio: fechaInicio,
                                fechaFin: fechaFin,
                                estadoReserva: "Activo",
                                herramientaReserva: { id: herramienta.id }
                                // Si tienes datos del cliente logueado, puedes agregar: cliente: { id: ... }
                            })
                        });

                        if (response.ok) {
                            alert(`¡Reserva realizada para "${nombre}"!\nDel ${fechaInicio} al ${fechaFin}`);
                            // Aquí podrías actualizar la tabla de reservas si lo deseas
                        } else {
                            const errorText = await response.text();
                            alert(`Error al reservar: ${response.status} - ${errorText}`);
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

// --- Función de debugging para probar el endpoint ---
async function probarEndpoint() {
    const token = getToken();
    if (!token) return;

    const variacionesToken = [
        { name: 'Token sin Bearer', value: token },
        { name: 'Token con Bearer', value: `Bearer ${token}` },
        { name: 'Token limpio', value: token.replace(/^Bearer\s+/, '') }
    ];

    for (const variacion of variacionesToken) {
        try {
            const response = await fetch(`${API_BASE}/findAll`, {
                method: 'GET',
                headers: {
                    'Authorization': variacion.value,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('¡ÉXITO! Datos recibidos:', data);
                return variacion;
            } else {
                const errorText = await response.text();
                console.log(`Error ${response.status}: ${errorText}`);
            }

        } catch (error) {
            console.error('Error de red:', error);
        }
    }
}

// --- Función para probar otros endpoints ---
async function probarOtrosEndpoints() {
    const token = getToken();
    if (!token) return;

    const baseUrls = [
        'http://localhost:8080/api/herramienta',
        'http://localhost:8080/api/herramientas',
        'http://localhost:8080/herramienta',
        'http://localhost:8080/herramientas'
    ];

    const endpoints = [
        '/findAll',
        '/all',
        '/list',
        '',
        '/test',
        '/health'
    ];

    for (const baseUrl of baseUrls) {
        for (const endpoint of endpoints) {
            const url = `${baseUrl}${endpoint}`;
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                const texto = await response.text();
                console.log('Respuesta:', texto);

            } catch (error) {
                console.error('Error al conectar:', error);
            }
        }
    }
}
