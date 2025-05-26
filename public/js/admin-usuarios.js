const API_BASE = 'http://localhost:8080/api/usuario';

const usuarioForm = document.getElementById('usuarioForm');
const editModeInput = document.getElementById('editMode');
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const contraseñaInput = document.getElementById('contraseña');
const rolSelect = document.getElementById('rol');
const usuarioTableBody = document.getElementById('usuarioTableBody');
const notificaciones = document.getElementById('notificaciones');

// Función para obtener token de localStorage (NO redirige)
function getToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    mostrarNotificacion('No autorizado. Por favor, inicia sesión.', 'error');
    return null;
  }
  return token;
}

// Función para mostrar notificaciones temporales
function mostrarNotificacion(mensaje, tipo = 'success') {
  const div = document.createElement('div');
  div.className = `toast ${tipo}`;
  div.textContent = mensaje;
  notificaciones.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// Función para extraer roles de cualquier formato y devolver string legible
function extraerRoles(rolesData) {
  if (!rolesData) return '';

  let rolesArray = [];

  if (typeof rolesData === 'string') {
    rolesArray = rolesData.split(',').map(r => r.trim());
  } else if (Array.isArray(rolesData)) {
    rolesArray = rolesData.map(r => {
      if (typeof r === 'string') return r;
      if (typeof r === 'object' && (r.rol || r.name)) return r.rol || r.name;
      return '';
    }).filter(r => r);
  } else {
    console.warn('Formato inesperado en roles:', rolesData);
  }

  const result = rolesArray
    .map(r => r.replace(/^ROLE_/, '').toUpperCase())
    .join(', ');

  return result;
}

// Función para mapear nombre de rol a id de select
function mapRolNombreAId(rolNombre) {
  if (!rolNombre) return '';
  switch (rolNombre.toUpperCase()) {
    case 'ADMINISTRADOR': return '1';
    case 'PROVEEDOR': return '2';
    case 'CLIENTE': return '3';
    default: return '';
  }
}

// Función para mapear id a nombre de rol
function mapRolIdANombre(id) {
  switch (id) {
    case '1': return 'ADMINISTRADOR';
    case '2': return 'PROVEEDOR';
    case '3': return 'CLIENTE';
    default: return '';
  }
}

// Cargar todos los usuarios y mostrarlos en la tabla
async function cargarUsuarios() {
  try {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/findAll`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      mostrarNotificacion('Sesión expirada o token inválido. Por favor, vuelve a iniciar sesión.', 'error');
      localStorage.removeItem('token');
      return;
    }

    if (!res.ok) throw new Error('Error cargando usuarios');

    const usuarios = await res.json();
    usuarioTableBody.innerHTML = '';

    usuarios.forEach(usuario => {
      const rolesStr = extraerRoles(usuario.roles);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${usuario.id || ''}</td>
        <td>${usuario.nombre || ''}</td>
        <td>${usuario.username || ''}</td>
        <td>${rolesStr}</td>
        <td>
          <button class="editar-btn" data-username="${usuario.username}"><i class='bx bx-edit'></i></button>
          <button class="eliminar-btn" data-username="${usuario.username}"><i class='bx bx-trash'></i></button>
        </td>
      `;
      usuarioTableBody.appendChild(tr);
    });

    // Agregar eventos a botones de editar y eliminar
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.getAttribute('data-username');
        cargarUsuarioParaEditar(username);
      });
    });

    document.querySelectorAll('.eliminar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.getAttribute('data-username');
        if (confirm(`¿Eliminar usuario ${username}?`)) {
          eliminarUsuario(username);
        }
      });
    });

  } catch (error) {
    mostrarNotificacion('Error al cargar usuarios', 'error');
    console.error(error);
  }
}

// Cargar datos de un usuario para edición

async function cargarUsuarioParaEditar(username) {
  try {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/find/${username}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      mostrarNotificacion('Sesión expirada o token inválido. Por favor, vuelve a iniciar sesión.', 'error');
      localStorage.removeItem('token');
      return;
    }

    if (!res.ok) throw new Error('Usuario no encontrado');
    const usuario = await res.json();

    editModeInput.value = 'true';
    nombreInput.value = usuario.nombre || '';
    emailInput.value = usuario.username || '';
    contraseñaInput.value = '';

    const rolesStr = extraerRoles(usuario.roles);
    const primerRol = rolesStr.split(',')[0] || '';
    rolSelect.value = mapRolNombreAId(primerRol);

    if (!rolSelect.value) {
      console.warn('No se pudo mapear el rol a select:', primerRol);
    }

    emailInput.disabled = true;

    // --- Scroll al formulario ---
    usuarioForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (error) {
    mostrarNotificacion('Error al cargar usuario', 'error');
    console.error(error);
  }
}


// Evento para guardar o actualizar usuario
usuarioForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const email = emailInput.value.trim();
  const contraseña = contraseñaInput.value.trim();
  const rolId = rolSelect.value;

  if (!nombre || !email || (!contraseña && editModeInput.value !== 'true') || !rolId) {
    mostrarNotificacion('Completa todos los campos', 'error');
    return;
  }

  const rolNombre = mapRolIdANombre(rolId);
  const usuarioDTO = {
    nombre,
    username: email,
    password: contraseña || undefined,
    roleListName: [rolNombre]
  };

  try {
    const token = getToken();
    if (!token) return;

    let res;
    if (editModeInput.value === 'true') {
      res = await fetch(`${API_BASE}/update/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuarioDTO),
      });
    } else {
      res = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuarioDTO),
      });
    }

    if (res.status === 401) {
      mostrarNotificacion('Sesión expirada o token inválido. Por favor, vuelve a iniciar sesión.', 'error');
      localStorage.removeItem('token');
      return;
    }

    if (!res.ok) {
      const errorText = await res.text();
      mostrarNotificacion('Error: ' + errorText, 'error');
      return;
    }

    mostrarNotificacion(editModeInput.value === 'true' ? 'Usuario actualizado' : 'Usuario creado');

    usuarioForm.reset();
    editModeInput.value = 'false';
    emailInput.disabled = false;

    cargarUsuarios();

  } catch (error) {
    mostrarNotificacion('Error al guardar usuario', 'error');
    console.error(error);
  }
});

// Eliminar usuario
async function eliminarUsuario(username) {
  try {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/delete/${username}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      mostrarNotificacion('Sesión expirada o token inválido. Por favor, vuelve a iniciar sesión.', 'error');
      localStorage.removeItem('token');
      return;
    }

    if (!res.ok) {
      const errorText = await res.text();
      mostrarNotificacion('Error al eliminar: ' + errorText, 'error');
      return;
    }

    mostrarNotificacion('Usuario eliminado');
    cargarUsuarios();

  } catch (error) {
    mostrarNotificacion('Error al eliminar usuario', 'error');
    console.error(error);
  }
}

// Al cargar la página, obtener la lista de usuarios
cargarUsuarios();
