// --- URL base de la API de herramientas ---
const API_BASE = 'http://localhost:8080/api/herramienta';

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

  console.log('Token original:', token.substring(0, 50) + '...');

  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
    console.log('Token sin Bearer prefix:', token.substring(0, 50) + '...');
  }

  const partes = token.split('.');
  if (partes.length !== 3) {
    console.error('Token no tiene 3 partes (no es JWT válido)');
    alert('Token inválido.');
    localStorage.removeItem('token');
    return null;
  }

  try {
    const payload = JSON.parse(atob(partes[1]));
    const ahora = Date.now();

    console.log('Payload decodificado:', payload);
    console.log('Tiempo actual:', new Date(ahora));
    console.log('Expiración del token:', new Date(payload.exp * 1000));

    if (payload.exp * 1000 < ahora) {
      console.error('Token expirado');
      alert('Tu sesión ha expirado.');
      localStorage.removeItem('token');
      return null;
    }

    const authorities = payload.authorities || [];
    let rol = 'desconocido';
    let authoritiesList = [];

    if (typeof authorities === 'string') {
      authoritiesList = authorities.split(',').map(auth => auth.trim());
      rol = authorities;
    } else if (Array.isArray(authorities)) {
      authoritiesList = authorities;
      rol = authorities.join(', ');
    }

    console.log(`Token válido. Rol del usuario: ${rol}`);
    console.log('Authorities completas:', authorities);
    console.log('Authorities como array:', authoritiesList);

    const esCliente = authoritiesList.includes('CLIENTE') ||
      authoritiesList.includes('ROLE_CLIENTE') ||
      authoritiesList.some(auth => auth.includes('CLIENTE')) ||
      (typeof authorities === 'string' && authorities.includes('CLIENTE'));

    if (esCliente) {
      console.log('%c¡Este token pertenece a un CLIENTE!', 'color: green; font-weight: bold;');
    } else {
      console.warn('Este token NO pertenece a un cliente.');
      alert('No tienes permisos de cliente para ver las herramientas.');
      return null;
    }

  } catch (e) {
    console.error('Error al decodificar token:', e);
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

  console.log('Headers de la petición:', headers);
  console.log('URL completa:', `${API_BASE}/findAll`);

  try {
    const response = await fetch(`${API_BASE}/findAll`, {
      method: 'GET',
      headers: headers
    });

    console.log('Status de respuesta:', response.status);

    if (response.status === 401 || response.status === 403) {
      const errorText = await response.text();
      alert(`Acceso denegado: ${errorText}`);
      toolCardsContainer.innerHTML = `<p>Error ${response.status}: ${errorText}</p>`;
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      alert(`Error al cargar herramientas: ${response.status} - ${errorText}`);
      toolCardsContainer.innerHTML = `<p>Error ${response.status}: ${errorText}</p>`;
      return;
    }

    const herramientas = await response.json();
    console.log('Herramientas recibidas:', herramientas);
    mostrarHerramientas(herramientas);

  } catch (error) {
    console.error('Error de conexión:', error);
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

  console.log(`Mostrando ${herramientas.length} herramientas`);

  herramientas.forEach(herramienta => {
    const card = document.createElement('div');
    card.classList.add('tool-card');

    const nombre = herramienta.nombre || 'Sin nombre';
    const descripcion = herramienta.descripcion || 'Sin descripción';
    const precio = !isNaN(herramienta.precio) ? parseFloat(herramienta.precio).toFixed(2) : '0.00';
    const stock = herramienta.stock ?? 0;
    const imagen = herramienta.imagen?.trim() !== '' ? herramienta.imagen : '/images/default-tool.png';

    card.innerHTML = `
      <img src="${imagen}" alt="${nombre}" onerror="this.src='/images/default-tool.png'" />
      <h3>${nombre}</h3>
      <p>${descripcion}</p>
      <p><strong>Precio:</strong> $${precio}</p>
      <p><strong>Stock:</strong> ${stock}</p>
    `;

    toolCardsContainer.appendChild(card);
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
  console.log('Recargando herramientas...');
  cargarHerramientas();
}

if (recargarBtn) {
  recargarBtn.addEventListener('click', recargarHerramientas);
}

// --- Función de debugging para probar el endpoint ---
async function probarEndpoint() {
  const token = getToken();
  if (!token) return;

  console.log('=== DEBUGGING ENDPOINT ===');

  const variacionesToken = [
    { name: 'Token sin Bearer', value: token },
    { name: 'Token con Bearer', value: `Bearer ${token}` },
    { name: 'Token limpio', value: token.replace(/^Bearer\s+/, '') }
  ];

  for (const variacion of variacionesToken) {
    console.log(`\n--- Probando: ${variacion.name} ---`);
    console.log('Valor:', variacion.value.substring(0, 50) + '...');

    try {
      const response = await fetch(`${API_BASE}/findAll`, {
        method: 'GET',
        headers: {
          'Authorization': variacion.value,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`Status: ${response.status}`);

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

  console.log('=== FIN DEBUGGING ===');
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

  console.log('=== PROBANDO OTROS ENDPOINTS ===');

  for (const baseUrl of baseUrls) {
    for (const endpoint of endpoints) {
      const url = `${baseUrl}${endpoint}`;
      console.log(`\nProbando: ${url}`);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        console.log(`Status: ${response.status}`);
        const texto = await response.text();
        console.log('Respuesta:', texto);

      } catch (error) {
        console.error('Error al conectar:', error);
      }
    }
  }

  console.log('=== FIN DE PRUEBAS ===');
}
