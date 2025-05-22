const API_BASE = 'http://192.168.1.87:8080/api/usuario';

// Función para mostrar notificaciones simples
function showNotification(message, isError = false) {
  const container = document.getElementById('notificaciones');
  container.textContent = message;
  container.style.color = isError ? 'red' : 'green';
  setTimeout(() => (container.textContent = ''), 3000);
}

// LOGIN: enviar email y contraseña, guardar token
async function login(email, contraseña) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contraseña }),
    });

    if (!res.ok) throw new Error('Credenciales inválidas');

    const data = await res.json();
    // Aquí asumo que backend envía un token JWT en data.token (modifica backend si no)
    localStorage.setItem('token', data.token);
    showNotification('Login exitoso');
    await loadUsuarios(); // carga usuarios tras login
  } catch (error) {
    showNotification(error.message, true);
  }
}

// OBTENER usuarios
async function loadUsuarios() {
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Debes iniciar sesión', true);
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/findAll`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('No autorizado');

    const usuarios = await res.json();
    const tbody = document.getElementById('usuarioTableBody');
    tbody.innerHTML = '';
    usuarios.forEach((user) => {
      tbody.innerHTML += `
        <tr>
          <td>${user.id}</td>
          <td>${user.nombre}</td>
          <td>${user.username}</td>
          <td>${user.roles.map(r => r.name).join(', ')}</td>
          <td>
            <button onclick="editUsuario('${user.username}')">Editar</button>
            <button onclick="deleteUsuario('${user.username}')">Eliminar</button>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    showNotification(error.message, true);
  }
}

// GUARDAR o ACTUALIZAR usuario
async function saveUsuario(event) {
  event.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Debes iniciar sesión', true);
    return;
  }

  const editMode = document.getElementById('editMode').value === 'true';
  const nombre = document.getElementById('nombre').value;
  const username = document.getElementById('email').value;
  const contraseña = document.getElementById('contraseña').value;
  const rolValue = document.getElementById('rol').value;

  // Prepara el DTO para backend (modifica según tu DTO exacto)
  const usuarioDTO = {
    nombre: nombre,
    username: username,
    password: contraseña,
    roles: [{ name: rolValue }], 
  };

  try {
    const url = editMode
      ? `${API_BASE}/update/${username}`
      : `${API_BASE}/save`;

    const method = editMode ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(usuarioDTO),
    });

    if (!res.ok) {
      const errMsg = await res.text();
      throw new Error(errMsg || 'Error al guardar usuario');
    }

    showNotification(editMode ? 'Usuario actualizado' : 'Usuario creado');
    document.getElementById('usuarioForm').reset();
    document.getElementById('editMode').value = 'false';
    await loadUsuarios();
  } catch (error) {
    showNotification(error.message, true);
  }
}

// EDITAR usuario: carga datos al form
async function editUsuario(username) {
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Debes iniciar sesión', true);
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/find/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Usuario no encontrado');

    const user = await res.json();

    document.getElementById('nombre').value = user.nombre;
    document.getElementById('email').value = user.username;
    // No se carga contraseña por seguridad
    document.getElementById('contraseña').value = '';
    if(user.roles && user.roles.length > 0){
      document.getElementById('rol').value = user.roles[0].name; // ajustar según cómo venga el rol
    }
    document.getElementById('editMode').value = 'true';
  } catch (error) {
    showNotification(error.message, true);
  }
}

// ELIMINAR usuario
async function deleteUsuario(username) {
  if (!confirm(`¿Seguro que quieres eliminar a ${username}?`)) return;

  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Debes iniciar sesión', true);
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/delete/${username}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al eliminar usuario');
    showNotification('Usuario eliminado');
    await loadUsuarios();
  } catch (error) {
    showNotification(error.message, true);
  }
}

// Escucha submit del form
document.getElementById('usuarioForm').addEventListener('submit', saveUsuario);

// Carga usuarios al iniciar
loadUsuarios();
