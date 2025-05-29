const apiUrl = 'http://localhost:8080/api/pago';
const pagosTableBody = document.getElementById('pagosTableBody');
const pagoForm = document.getElementById('pagoForm');
const editModeInput = document.getElementById('editMode');
let currentPagoId = null;

// Obtener token guardado en localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Decodificar payload JWT (base64 decode)
function parseJwt(token) {
    if (!token) return null;
    try {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
}

// Obtener roles del payload del token (diferentes posibles campos)
function getRolesFromPayload(payload) {
    return payload.roles || payload.role || payload.authorities || [];
}

// Debug completo del token en consola
function debugToken() {
    console.log('=== DEBUG TOKEN ===');
    const token = getToken();
    console.log('Token completo:', token);

    if (token) {
        const payload = parseJwt(token);
        console.log('Payload completo del token:', payload);

        if (payload) {
            const roles = getRolesFromPayload(payload);
            console.log('Roles disponibles:', roles);
            console.log('Usuario:', payload.sub || payload.username || payload.user || payload.email);
            console.log('Expiración:', payload.exp ? new Date(payload.exp * 1000) : 'No definida');

            console.log('Todos los campos del payload:');
            Object.keys(payload).forEach(key => {
                console.log(`  ${key}:`, payload[key]);
                if (key.toLowerCase().includes('role') || key.toLowerCase().includes('auth')) {
                    console.log(`  --> Campo relacionado con roles: ${key}:`, payload[key]);
                }
            });
        }
    } else {
        console.log('No hay token en localStorage');
        console.log('Contenido actual de localStorage:', localStorage);
    }
    console.log('=== FIN DEBUG TOKEN ===');
}

// Ejecutar debug token al cargar la página
debugToken();

// Función para listar pagos desde la API
async function listarPagos() {
    if (!pagosTableBody) {
        console.error('No se encontró el elemento pagosTableBody');
        return;
    }

    // Mostrar mensaje de carga
    pagosTableBody.innerHTML = `<tr><td colspan="6">Cargando pagos...</td></tr>`;

    try {
        const token = getToken();
        if (!token) {
            pagosTableBody.innerHTML = `<tr><td colspan="6">No autorizado. Inicia sesión.</td></tr>`;
            console.error('No hay token disponible');
            return;
        }

        console.log('Haciendo petición a:', `${apiUrl}/findAll`);
        console.log('Con token:', token);

        const response = await fetch(`${apiUrl}/findAll`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'  // aunque no se envía body, a veces ayuda
            }
        });

        console.log('Respuesta del servidor:', response.status, response.statusText);

        if (response.status === 401) {
            pagosTableBody.innerHTML = `<tr><td colspan="6">No autorizado (401). Verifica tu token y roles.</td></tr>`;
            console.error('Error 401: No autorizado - El token puede estar expirado o no tener los roles correctos');
            return;
        }

        if (response.status === 403) {
            pagosTableBody.innerHTML = `<tr><td colspan="6">Acceso prohibido (403). No tienes permisos suficientes.</td></tr>`;
            console.error('Error 403: Acceso prohibido - El usuario no tiene rol de ADMIN');
            return;
        }

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        const pagos = await response.json();
        console.log('Pagos recibidos:', pagos);

        if (!Array.isArray(pagos) || pagos.length === 0) {
            pagosTableBody.innerHTML = `<tr><td colspan="6">No hay pagos registrados.</td></tr>`;
            return;
        }

        renderizarPagos(pagos);

    } catch (error) {
        console.error('Error completo:', error);

        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            pagosTableBody.innerHTML = `<tr><td colspan="6">Error de conexión. Verifica que el servidor esté ejecutándose en puerto 8080.</td></tr>`;
            console.error('Error de conexión - El servidor backend no está disponible');
        } else {
            pagosTableBody.innerHTML = `<tr><td colspan="6">Error al cargar los pagos: ${error.message}</td></tr>`;
        }
    }
}

// Función para mostrar pagos en la tabla
function renderizarPagos(pagos) {
    pagosTableBody.innerHTML = '';
    pagos.forEach(pago => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pago.id || '-'}</td>
            <td>${pago.monto || '-'}</td>
            <td>${pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : '-'}</td>
            <td>${pago.estadoPago || '-'}</td>
            <td>${pago.metodoDePago || '-'}</td>
            <td>
                <button class="btn-edit" type="button" data-id="${pago.id}">Editar</button>
                <button class="btn-delete" type="button" data-id="${pago.id}">Eliminar</button>
            </td>
        `;
        pagosTableBody.appendChild(row);
    });

    // Añadir listeners a botones Editar
    pagosTableBody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            editarPago(id);
        });
    });

    // Añadir listeners a botones Eliminar
    pagosTableBody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            eliminarPago(id);
        });
    });
}

// Función ejemplo para editar pago (deberías adaptarla según tu formulario y API)
async function editarPago(id) {
    try {
        const token = getToken();
        if (!token) {
            alert('No autorizado. Inicia sesión.');
            return;
        }

        const response = await fetch(`${apiUrl}/findById/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener el pago para editar');
        }

        const pago = await response.json();

        // Aquí llenas tu formulario con los datos para editar
        pagoForm.elements['id'].value = pago.id;
        pagoForm.elements['monto'].value = pago.monto;
        pagoForm.elements['fechaPago'].value = pago.fechaPago ? new Date(pago.fechaPago).toISOString().slice(0,10) : '';
        pagoForm.elements['estadoPago'].value = pago.estadoPago;
        pagoForm.elements['metodoDePago'].value = pago.metodoDePago;

        currentPagoId = pago.id;
        editModeInput.value = 'true';

        // Mostrar formulario o modal aquí si lo tienes
        console.log('Formulario listo para editar pago id:', id);

    } catch (error) {
        alert('Error al cargar datos del pago: ' + error.message);
    }
}

// Función ejemplo para eliminar pago
async function eliminarPago(id) {
    if (!confirm('¿Estás seguro que quieres eliminar este pago?')) return;

    try {
        const token = getToken();
        if (!token) {
            alert('No autorizado. Inicia sesión.');
            return;
        }

        const response = await fetch(`${apiUrl}/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            alert('No tienes permisos para eliminar este pago.');
            return;
        }

        if (!response.ok) {
            throw new Error('Error al eliminar pago');
        }

        alert('Pago eliminado correctamente');
        listarPagos();  // refrescar tabla

    } catch (error) {
        alert('Error al eliminar pago: ' + error.message);
    }
}

// Escuchar evento DOMContentLoaded para cargar la lista
window.addEventListener('DOMContentLoaded', () => {
    listarPagos();
});
