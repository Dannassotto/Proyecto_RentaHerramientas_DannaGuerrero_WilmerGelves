// --- Toggle entre formularios de registro e inicio de sesión ---
const container = document.getElementById('container');
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');

const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('signInForm');

signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

// --- Función para decodificar el JWT ---
function parseJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (e) {
    console.error('Error decodificando JWT:', e);
    return null;
  }
}

// --- Función para extraer roles de diferentes formatos ---
function parseRoles(rawRoles) {
  if (!rawRoles) return [];
  if (typeof rawRoles === 'string') {
    return rawRoles.split(',').map(r => r.trim().replace(/^ROLE_/, '').toUpperCase());
  } else if (Array.isArray(rawRoles)) {
    return rawRoles.map(r => {
      if (typeof r === 'string') {
        return r.replace(/^ROLE_/, '').toUpperCase();
      } else if (r.authority) {
        return r.authority.replace(/^ROLE_/, '').toUpperCase();
      }
      return '';
    }).filter(r => r);
  }
  return [];
}

// --- Iniciar sesión ---
async function login(username, password, redirectAfterLogin = true) {
  try {
    const response = await fetch('http://localhost:8080/auth/log-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let message = 'Credenciales inválidas';
      try {
        const errorData = await response.json();
        if (errorData.message) message = errorData.message;
      } catch (_) { }
      alert('Error en login: ' + message);
      return;
    }

    const data = await response.json();
    console.log('Datos recibidos en login:', data);

    // Guardar solo el token JWT puro (sin "Bearer ")
    const token = data.jwt || data.token;
    if (!token) {
      alert('No se recibió token en la respuesta');
      return;
    }
    localStorage.setItem('token', token);

    // --- GUARDAR proveedorId SI EL USUARIO ES PROVEEDOR ---
    let proveedorId = null;
    if (data.id && data.roles && Array.isArray(data.roles)) {
      const esProveedor = data.roles.some(r => (r.roleEnum || '').toUpperCase().includes("PROVEEDOR"));
      if (esProveedor) {
        proveedorId = data.id;
      }
    }
    if (!proveedorId) {
      const payload = parseJwt(token);
      if (payload && payload.id && payload.authorities) {
        const roles = parseRoles(payload.authorities);
        if (roles.some(r => r.includes("PROVEEDOR"))) {
          proveedorId = payload.id;
        }
      }
    }
    if (proveedorId) {
      localStorage.setItem('proveedorId', proveedorId);
      console.log('ProveedorId guardado en localStorage:', proveedorId);
    } else {
      localStorage.removeItem('proveedorId');
    }

    // --- GUARDAR clienteId SI EL USUARIO ES CLIENTE ---
    let clienteId = null;
    if (data.id && data.roles && Array.isArray(data.roles)) {
      const esCliente = data.roles.some(r => (r.roleEnum || '').toUpperCase().includes("CLIENTE"));
      if (esCliente) {
        clienteId = data.id;
        console.log('Es cliente por roles en data:', clienteId);
      } else {
        console.log('No es cliente según roles en data:', data.roles);
      }
    }
    // Si el backend responde con otro campo, por ejemplo data.clienteId
    if (!clienteId && data.clienteId) {
      clienteId = data.clienteId;
      console.log('ClienteId encontrado en data.clienteId:', clienteId);
    }
    if (!clienteId) {
      const payload = parseJwt(token);
      if (payload && payload.id && payload.authorities) {
        const roles = parseRoles(payload.authorities);
        if (roles.some(r => r.includes("CLIENTE"))) {
          clienteId = payload.id;
          console.log('Es cliente por roles en JWT:', clienteId);
        }
      }
    }
    if (clienteId) {
      localStorage.setItem('clienteId', clienteId);
      console.log('ClienteId guardado en localStorage:', clienteId);
    } else {
      localStorage.removeItem('clienteId');
      console.log('No se guardó clienteId. ¿Seguro que este usuario es cliente?');
    }

    if (redirectAfterLogin) {
      const payload = parseJwt(token);
      console.log('Payload completo del JWT:', payload);

      let roles = [];

      if (payload) {
        if (payload.authorities) {
          roles = parseRoles(payload.authorities);
        } else if (payload.roles) {
          roles = parseRoles(payload.roles);
        } else if (payload.role) {
          roles = parseRoles([payload.role]);
        } else {
          console.warn('No se encontraron roles en el token');
        }
      }

      console.log('Roles extraídos del token:', roles);
      if (roles.length > 0) {
        localStorage.setItem('userRole', roles[0]);
      }

      if (roles.includes('CLIENTE')) {
        window.location.href = '/cliente/inicio';
      } else if (roles.includes('PROVEEDOR')) {
        window.location.href = '/proveedor/inicio';
      } else if (roles.includes('ADMINISTRADOR') || roles.includes('ADMIN')) {
        window.location.href = '/administrador/dashboard';
      } else {
        alert('Rol no reconocido');
      }
    }

  } catch (error) {
    alert('Error al conectar con el servidor');
    console.error(error);
  }
}

// --- Registro de usuario ---
async function signUp(nombre, email, contraseña) {
  try {
    const response = await fetch('http://localhost:8080/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        username: email,
        password: contraseña,
        roleRequest: { roleListName: ["CLIENTE"] }
      }),
    });

    if (!response.ok) {
      let message = 'No se pudo registrar';
      try {
        const contentType = response.headers.get('content-type');
        const errorBody = contentType && contentType.includes('application/json')
          ? await response.json()
          : await response.text();

        if (typeof errorBody === 'string') {
          message = errorBody;
        } else if (errorBody.message) {
          message = errorBody.message;
        }
      } catch (_) { }
      alert('Error en registro: ' + message);
      return;
    }

    alert('Registro exitoso. Ahora inicia sesión con tus credenciales.');
    signUpForm.reset();

    // NO inicies sesión automáticamente, deja que el usuario lo haga manualmente
    // await login(email, contraseña, true);

  } catch (error) {
    alert('Error al conectar con el servidor');
    console.error(error);
  }
}

// --- Evento submit para el login ---
signInForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = signInForm.querySelector('input[name="email"]').value.trim();
  const password = signInForm.querySelector('input[name="contraseña"]').value.trim();

  if (!email || !password) {
    alert('Por favor completa todos los campos');
    return;
  }

  login(email, password);
});

// --- Evento submit para el registro ---
signUpForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const nombre = signUpForm.querySelector('input[name="nombre"]').value.trim();
  const email = signUpForm.querySelector('input[name="email"]').value.trim();
  const contraseña = signUpForm.querySelector('input[name="contraseña"]').value.trim();

  if (!nombre || !email || !contraseña) {
    alert('Por favor completa todos los campos');
    return;
  }

  signUp(nombre, email, contraseña);
});