// URL base de la API de usuario
const API_BASE = 'http://localhost:8080/api/usuario';

// Referencias a los elementos del DOM
const usuarioForm = document.getElementById('usuarioForm');
const editModeInput = document.getElementById('editMode');
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const contraseñaInput = document.getElementById('contraseña');
const rolSelect = document.getElementById('rol');
const usuarioTableBody = document.getElementById('usuarioTableBody');
const notificaciones = document.getElementById('notificaciones');

// Obtiene el token del localStorage y redirige si no existe (protección de ruta)
function getToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('No autorizado. Por favor, inicia sesión.');
    window.location.href = '/login.html';
  }
  return token;
}

// Muestra una notificación visual en pantalla (tipo: success o error)
function mostrarNotificacion(mensaje, tipo = 'success') {
  const div = document.createElement('div');
  div.className = `toast ${tipo}`;
  div.textContent = mensaje;
  notificaciones.appendChild(div);
  setTimeout(() => div.remove(), 3000); // Desaparece a los 3 segundos
}

// Carga todos los usuarios desde el backend y los muestra en una tabla
async function cargarUsuarios() {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/findAll`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Si el token expiró, redirige al login
    if (res.status === 401) {
      alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
      localStorage.removeItem('token');
      window.location.href = '/login.html';
      return;
    }

    if (!res.ok) throw new Error('Error cargando usuarios');

    const usuarios = await res.json();
    usuarioTableBody.innerHTML = ''; // Limpia la tabla

    usuarios.forEach(usuario => {
      let rolNombre = 'Desconocido';

      // Extrae el nombre del rol desde el arreglo o propiedad
      if (Array.isArray(usuario.roles) && usuario.roles.length > 0) {
        if (typeof usuario.roles[0] === 'string') {
          rolNombre = usuario.roles[0];
        } else if (usuario.roles[0].rol) {
          rolNombre = usuario.roles[0].rol;
        }
      } else if (typeof usuario.roles === 'string') {
        rolNombre = usuario.roles;
      }

      // Crea una fila en la tabla con los datos del usuario
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${usuario.id || ''}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.username}</td>
        <td>${rolNombre}</td>
        <td>
          <button class="editar-btn" data-username="${usuario.username}"><i class='bx bx-edit'></i></button>
          <button class="eliminar-btn" data-username="${usuario.username}"><i class='bx bx-trash'></i></button>
        </td>
      `;
      usuarioTableBody.appendChild(tr);
    });

    // Agrega evento a los botones de editar
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.getAttribute('data-username');
        cargarUsuarioParaEditar(username);
      });
    });

    // Agrega evento a los botones de eliminar
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

// Carga un usuario específico para editarlo
async function cargarUsuarioParaEditar(username) {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/find/${username}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Usuario no encontrado');
    const usuario = await res.json();

    // Rellena el formulario con los datos del usuario
    editModeInput.value = 'true';
    nombreInput.value = usuario.nombre || '';
    emailInput.value = usuario.username || '';
    contraseñaInput.value = ''; // Contraseña no se carga por seguridad
    rolSelect.value = mapRolNombreAId(usuario.roles); // Convierte el nombre del rol a ID

    emailInput.disabled = true; // Deshabilita el campo email al editar

  } catch (error) {
    mostrarNotificacion('Error al cargar usuario', 'error');
    console.error(error);
  }
}

// Convierte el nombre del rol a su ID correspondiente
function mapRolNombreAId(roles) {
  if (!roles || roles.length === 0) return '';
  const rolName = typeof roles[0] === 'string' ? roles[0] : roles[0].rol;
  switch (rolName.toUpperCase()) {
    case 'ADMINISTRADOR': return '1';
    case 'PROVEEDOR': return '2';
    case 'CLIENTE': return '3';
    default: return '';
  }
}

// Convierte el ID del rol a su nombre
function mapRolIdANombre(id) {
  switch (id) {
    case '1': return 'ADMINISTRADOR';
    case '2': return 'PROVEEDOR';
    case '3': return 'CLIENTE';
    default: return '';
  }
}

// Evento al enviar el formulario (crear o actualizar usuario)
usuarioForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita recarga de la página

  const nombre = nombreInput.value.trim();
  const email = emailInput.value.trim();
  const contraseña = contraseñaInput.value.trim();
  const rolId = rolSelect.value;

  // Validación básica
  if (!nombre || !email || (!contraseña && editModeInput.value !== 'true') || !rolId) {
    mostrarNotificacion('Completa todos los campos', 'error');
    return;
  }

  const rolNombre = mapRolIdANombre(rolId);

  // Crea el objeto usuario para enviar al backend
  const usuarioDTO = {
    nombre,
    username: email,
    password: contraseña || undefined, // Si está vacío y en modo edición, se omite
    roleListName: [rolNombre]
  };

  try {
    const token = getToken();
    let res;

    if (editModeInput.value === 'true') {
      // Actualiza usuario existente
      res = await fetch(`${API_BASE}/update/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuarioDTO),
      });
    } else {
      // Crea nuevo usuario
      res = await fetch(`${API_BASE}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(usuarioDTO),
      });
    }

    if (!res.ok) {
      const errorText = await res.text();
      mostrarNotificacion('Error: ' + errorText, 'error');
      return;
    }

    mostrarNotificacion(editModeInput.value === 'true' ? 'Usuario actualizado' : 'Usuario creado');

    // Limpia el formulario y recarga la tabla
    usuarioForm.reset();
    editModeInput.value = 'false';
    emailInput.disabled = false;
    cargarUsuarios();

  } catch (error) {
    mostrarNotificacion('Error al guardar usuario', 'error');
    console.error(error);
  }
});

// Elimina un usuario por su username
async function eliminarUsuario(username) {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/delete/${username}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      mostrarNotificacion('Error al eliminar: ' + errorText, 'error');
      return;
    }

    mostrarNotificacion('Usuario eliminado');
    cargarUsuarios(); // Recarga la tabla

  } catch (error) {
    mostrarNotificacion('Error al eliminar usuario', 'error');
    console.error(error);
  }
}

// Carga los usuarios al iniciar la página
cargarUsuarios();
