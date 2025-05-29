const navbar = document.querySelector(".navbar");
const btnToggle = document.getElementById("btn-toggle");
const search = document.querySelector(".bx-search");
const logoutBtn = document.getElementById("logout");
const container = document.querySelector(".container");
const API_URL = "http://localhost:8080/api/usuario";
const API_HERRAMIENTA = "http://localhost:8080/api/herramienta";
const tbody = document.getElementById("usuarioTableBody");
const totalUsuariosElem = document.getElementById("total-usuarios");
const totalHerramientasElem = document.getElementById("total-herramientas"); // NUEVO

/**
 * Obtiene el token almacenado en localStorage.
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Muestra una notificación simple (puedes personalizarla o usar la de tu framework).
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
  alert(mensaje); // Puedes reemplazar esto por tu sistema de notificaciones
}

/**
 * Extrae los nombres de los roles de un array de roles y los muestra como badges.
 */
function extraerRoles(roles) {
  if (!Array.isArray(roles)) return '';
  const traduccion = {
    'ADMINISTRADOR': 'ADMINISTRADOR',
    'PROVEEDOR': 'PROVEEDOR',
    'CLIENTE': 'CLIENTE'
  };
  return roles
    .map(r => {
      let nombre = r.rol || r.roleEnum || r.nombre || r.authority || '';
      nombre = nombre.replace(/^ROLE_/, '').toUpperCase();
      return traduccion[nombre] || nombre;
    })
    .map(role => `<span class="rol-badge">${role}</span>`)
    .join(' ');
}

// Función para cambiar el ícono del botón toggle
function updateToggleIcon() {
  if (navbar.classList.contains("collapsed")) {
    btnToggle.classList.replace("bx-left-arrow", "bx-menu");
  } else {
    btnToggle.classList.replace("bx-menu", "bx-left-arrow");
  }
}

// Restaurar estado desde localStorage al cargar
document.addEventListener("DOMContentLoaded", () => {
  const isCollapsed = localStorage.getItem("navbarCollapsed") === "true";
  if (isCollapsed) {
    navbar.classList.add("collapsed");
    container.classList.add("expanded"); // Ajuste del contenedor al cargar
  }
  updateToggleIcon();
  cargarUsuarios();
  cargarTotalHerramientas(); // NUEVO
});

// Evento click para toggle
if (btnToggle) {
  btnToggle.addEventListener("click", () => {
    navbar.classList.toggle("collapsed");
    container.classList.toggle("expanded"); // Ajuste del contenedor al colapsar/expandir
    updateToggleIcon();
    localStorage.setItem("navbarCollapsed", navbar.classList.contains("collapsed"));
  });
}

// Evento click para ícono de búsqueda (opcional)
if (search) {
  search.addEventListener("click", () => {
    navbar.classList.toggle("collapsed");
    container.classList.toggle("expanded");
    updateToggleIcon();
    localStorage.setItem("navbarCollapsed", navbar.classList.contains("collapsed"));
  });
}

// Redireccionamiento al hacer click en logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "/"; // Redirige al login
  });
}

// Carga de usuarios en la tabla con autenticación y manejo de roles
async function cargarUsuarios() {
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4">Cargando usuarios...</td></tr>`;
  if (totalUsuariosElem) totalUsuariosElem.textContent = "Cargando...";
  try {
    const token = getToken();
    if (!token) {
      mostrarNotificacion('No hay sesión activa. Por favor, inicia sesión.', 'error');
      tbody.innerHTML = `<tr><td colspan="4">Sesión no iniciada.</td></tr>`;
      if (totalUsuariosElem) totalUsuariosElem.textContent = "Sesión no iniciada.";
      return;
    }

    const res = await fetch(`${API_URL}/findAll`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      mostrarNotificacion('Sesión expirada o token inválido. Por favor, vuelve a iniciar sesión.', 'error');
      localStorage.removeItem('token');
      tbody.innerHTML = `<tr><td colspan="4">Sesión expirada.</td></tr>`;
      if (totalUsuariosElem) totalUsuariosElem.textContent = "Sesión expirada.";
      return;
    }

    if (!res.ok) throw new Error("Error al obtener usuarios");

    const usuarios = await res.json();
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">No hay usuarios registrados.</td></tr>`;
      if (totalUsuariosElem) totalUsuariosElem.textContent = "0 registrados";
      return;
    }

    tbody.innerHTML = usuarios
      .map(
        (user) => `
        <tr>
          <td>${user.id || ''}</td>
          <td>${user.nombre || '-'}</td>
          <td>${user.email || user.username || '-'}</td>
          <td>${extraerRoles(user.roles)}</td>
        </tr>
      `
      )
      .join("");

    if (totalUsuariosElem) totalUsuariosElem.textContent = `${usuarios.length} registrados`;

  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="4">Error al cargar usuarios.</td></tr>`;
    if (totalUsuariosElem) totalUsuariosElem.textContent = "Error al cargar";
    mostrarNotificacion('Error al cargar usuarios', 'error');
    console.error("Error al cargar usuarios:", error);
  }
}

// NUEVO: Cargar el total de herramientas
async function cargarTotalHerramientas() {
  if (!totalHerramientasElem) return;
  totalHerramientasElem.textContent = "Cargando...";
  try {
    const token = getToken();
    if (!token) {
      totalHerramientasElem.textContent = "Sesión no iniciada.";
      return;
    }
    const res = await fetch(`${API_HERRAMIENTA}/findAll`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 401) {
      totalHerramientasElem.textContent = "Sesión expirada.";
      return;
    }
    if (!res.ok) throw new Error("Error al obtener herramientas");
    const herramientas = await res.json();
    totalHerramientasElem.textContent = `${herramientas.length} disponibles`;
  } catch (error) {
    totalHerramientasElem.textContent = "Error al cargar";
    console.error("Error al cargar herramientas:", error);
  }
}