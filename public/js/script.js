const API_BASE_URL = 'http://192.168.1.87:8080/api/usuario';

const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

// Animación entre login y registro
signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});
signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

// Redirección según rol recibido del backend
function loginUsuario(user) {
  console.log("Usuario recibido:", user);

  const roles = user.roles || [];
  const rolNombre = roles.length > 0
    ? (roles[0].nombre || roles[0].rol || roles[0])
    : null;

  if (!rolNombre) {
    alert("No se pudo obtener el rol del usuario.");
    return;
  }

  localStorage.setItem('usuario', JSON.stringify(user));
  localStorage.setItem('rol', rolNombre);

  const rol = rolNombre.toUpperCase();

  if (rol === "ROLE_ADMINISTRADOR") {
    window.location.href = '/administrador/dashboard';
  } else if (rol === "ROLE_CLIENTE") {
    window.location.href = '/cliente/inicio';
  } else if (rol === "ROLE_PROVEEDOR") {
    window.location.href = '/proveedor/inicio';
  } else {
    alert("Rol desconocido: " + rolNombre);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  // Login
  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = signInForm.querySelector('input[name="email"]').value.trim();
    const password = signInForm.querySelector('input[name="contraseña"]').value.trim();

    if (!email || !password) {
      alert("Por favor ingresa email y contraseña.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          contraseña: password
        })
      });

      if (response.status === 401) {
        alert("No autorizado: Verifica tus credenciales.");
        return;
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Error al iniciar sesión");
      }

      const data = await response.json();
      loginUsuario(data);
      signInForm.reset();
    } catch (error) {
      alert("Error: " + error.message);
    }
  });

  // Registro
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = signUpForm.querySelector('input[name="nombre"]').value.trim();
    const email = signUpForm.querySelector('input[name="email"]').value.trim();
    const password = signUpForm.querySelector('input[name="contraseña"]').value.trim();

    if (!name || !email || !password) {
      alert("Por favor completa todos los campos para registrarte.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: name,
          username: email,
          password: password,
          roles: [{ id: 3 }] // Asignar rol CLIENTE por defecto
        })
      });

      if (response.status === 401) {
        alert("No autorizado para registrar usuario.");
        return;
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Error al registrar");
      }

      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      signUpForm.reset();
      container.classList.remove("right-panel-active");
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
});
