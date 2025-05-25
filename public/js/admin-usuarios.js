document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();

  const form = document.getElementById('usuarioForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarUsuario();
  });
});

async function cargarUsuarios() {
  try {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      mostrarNotificacion('No estás autenticado. Por favor inicia sesión.', 'error');
      return;
    }

    const response = await fetch('http://localhost:8080/api/usuario/findAll', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const usuarios = await response.json();

    const tbody = document.getElementById('usuarioTableBody');
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.username}</td>
        <td>${usuario.roles.map(r => r.roleEnum).join(', ')}</td>
        <td>
          <button onclick="editarUsuario(${usuario.id})">Editar</button>
          <button onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    mostrarNotificacion('Error al cargar usuarios: ' + error.message, 'error');
  }
}

async function guardarUsuario() {
  try {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      mostrarNotificacion('No estás autenticado. Por favor inicia sesión.', 'error');
      return;
    }

    const editMode = document.getElementById('editMode').value === 'true';
    const id = editMode ? document.getElementById('usuarioForm').dataset.userId : null;
    const nombre = document.getElementById('nombre').value.trim();
    const username = document.getElementById('email').value.trim();
    const password = document.getElementById('contraseña').value.trim();
    const rolId = document.getElementById('rol').value;

    if (!nombre || !username || !password || !rolId) {
      mostrarNotificacion('Completa todos los campos', 'error');
      return;
    }

    // Construir objeto para la API
    const rolesMap = {
      '1': 'ADMIN',
      '2': 'PROVEEDOR',
      '3': 'USER'
    };
    const rolNombre = rolesMap[rolId];

    const usuarioData = {
      nombre,
      username,
      password,
      roleRequest: {
        roleListName: [rolNombre]
      }
    };

    const url = editMode ? `http://localhost:8080/api/usuario/${id}` : 'http://localhost:8080/api/usuario';
    const method = editMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(usuarioData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    mostrarNotificacion(editMode ? 'Usuario actualizado' : 'Usuario creado', 'success');
    limpiarFormulario();
    cargarUsuarios();

  } catch (error) {
    mostrarNotificacion('Error al guardar usuario: ' + error.message, 'error');
  }
}

function editarUsuario(id) {
  // Lógica para cargar usuario por id y poner datos en el formulario
  // Puedes implementar una llamada GET para traer ese usuario
  // Aquí un ejemplo sencillo:

  fetch(`http://localhost:8080/api/usuario/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    }
  })
  .then(res => {
    if (!res.ok) throw new Error('No se pudo cargar el usuario');
    return res.json();
  })
  .then(usuario => {
    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('email').value = usuario.username;
    // No rellenamos contraseña por seguridad
    // Seleccionar rol (asumiendo solo un rol)
    if (usuario.roles && usuario.roles.length > 0) {
      const rol = usuario.roles[0].roleEnum;
      const rolSelect = document.getElementById('rol');
      for (const option of rolSelect.options) {
        if (option.text === rol) {
          option.selected = true;
          break;
        }
      }
    }

    document.getElementById('editMode').value = 'true';
    document.getElementById('usuarioForm').dataset.userId = id;
  })
  .catch(error => {
    mostrarNotificacion(error.message, 'error');
  });
}

async function eliminarUsuario(id) {
  if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;

  try {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      mostrarNotificacion('No estás autenticado. Por favor inicia sesión.', 'error');
      return;
    }

    const response = await fetch(`http://localhost:8080/api/usuario/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    mostrarNotificacion('Usuario eliminado', 'success');
    cargarUsuarios();

  } catch (error) {
    mostrarNotificacion('Error al eliminar usuario: ' + error.message, 'error');
  }
}

function limpiarFormulario() {
  document.getElementById('usuarioForm').reset();
  document.getElementById('editMode').value = 'false';
  delete document.getElementById('usuarioForm').dataset.userId;
}

function mostrarNotificacion(mensaje, tipo) {
  const contenedor = document.getElementById('notificaciones');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;

  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
