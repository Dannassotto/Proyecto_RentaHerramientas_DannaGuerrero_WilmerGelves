const navbar = document.querySelector(".navbar");
const btnToggle = document.getElementById("btn-toggle");
const search = document.querySelector(".bx-search");
const logoutBtn = document.getElementById("logout");
const container = document.querySelector(".container");
const API_URL = "http://localhost:8080/api/usuario";
const tbody = document.getElementById("usuarioTableBody");

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

// Carga de usuarios en la tabla
async function cargarUsuarios() {
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4">Cargando usuarios...</td></tr>`;
  try {
    const res = await fetch(`${API_URL}/findAll`);
    if (!res.ok) throw new Error("Error al obtener usuarios");

    const usuarios = await res.json();
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">No hay usuarios registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = usuarios
      .map(
        (user) => `
        <tr>
          <td>${user.id}</td>
          <td>${user.nombre || "-"}</td>
          <td>${user.email}</td>
          <td>${user.rol?.rol || "-"}</td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="4">Error al cargar usuarios.</td></tr>`;
    console.error("Error al cargar usuarios:", error);
  }
}
