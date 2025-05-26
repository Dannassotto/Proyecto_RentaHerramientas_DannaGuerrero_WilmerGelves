const navbar = document.querySelector(".navbar");
const btnToggle = document.getElementById("btn-toggle");
const search = document.querySelector(".bx-search");
const logoutBtn = document.getElementById("logout");
const tbody = document.getElementById("usuarioTableBody");

// Función para cambiar el ícono del botón toggle
function updateToggleIcon() {
  if (navbar.classList.contains("collapsed")) {
    btnToggle.classList.replace("bx-left-arrow", "bx-menu");
  } else {
    btnToggle.classList.replace("bx-menu", "bx-left-arrow");
  }
}

// Función para actualizar el margin-left de main-content según el estado de la navbar
function updateMainContentMargin() {
  const mainContent = document.querySelector(".main-content");
  if (navbar.classList.contains("collapsed")) {
    mainContent.style.marginLeft = "70px";
  } else {
    mainContent.style.marginLeft = "250px";
  }
}

// Función para cargar usuarios desde la API y mostrar en tabla
async function cargarUsuarios() {
  const API_URL = "http://localhost:8080/api/usuario";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al cargar usuarios");
    const usuarios = await response.json();

    tbody.innerHTML = ""; // Limpia la tabla antes de insertar
    usuarios.forEach(usuario => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.email}</td>
        <td>${usuario.rol}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="3">No se pudo cargar la lista de usuarios</td></tr>`;
  }
}

// Restaurar estado desde localStorage al cargar
document.addEventListener("DOMContentLoaded", () => {
  const isCollapsed = localStorage.getItem("navbarCollapsed") === "true";
  if (isCollapsed) {
    navbar.classList.add("collapsed");
  } else {
    navbar.classList.remove("collapsed");
  }
  updateToggleIcon();
  updateMainContentMargin();
  cargarUsuarios();
});

// Evento click para toggle
if (btnToggle) {
  btnToggle.addEventListener("click", () => {
    navbar.classList.toggle("collapsed");
    updateToggleIcon();
    updateMainContentMargin();
    localStorage.setItem("navbarCollapsed", navbar.classList.contains("collapsed"));
  });
}

// Evento click para ícono de búsqueda (opcional)
if (search) {
  search.addEventListener("click", () => {
    navbar.classList.toggle("collapsed");
    updateToggleIcon();
    updateMainContentMargin();
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
