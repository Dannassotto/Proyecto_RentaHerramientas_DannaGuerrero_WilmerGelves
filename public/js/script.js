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
      } catch (_) {}
      alert('Error en login: ' + message);
      return;
    }

    const data = await response.json();
    console.log('Datos recibidos en login:', data); 

    // Guardar token en localStorage
    localStorage.setItem('token', data.jwt || data.token);

    if (redirectAfterLogin) {
      const roles = [];

      if (data.roles) {
        if (Array.isArray(data.roles)) roles.push(...data.roles);
        else if (typeof data.roles === 'string') roles.push(...data.roles.split(','));
      }
      if (data.authorities) {
        if (Array.isArray(data.authorities)) roles.push(...data.authorities);
        else if (typeof data.authorities === 'string') roles.push(...data.authorities.split(','));
      }
      if (data.roleListName) {
        if (Array.isArray(data.roleListName)) roles.push(...data.roleListName);
      }

      const rolesUpper = roles.map(r => r.trim().toUpperCase());
      console.log('Roles finales:', rolesUpper);

      if (rolesUpper.includes('CLIENTE')) {
        window.location.href = '/cliente/inicio';
      } else if (rolesUpper.includes('PROVEEDOR')) {
        window.location.href = '/proveedor/inicio';
      } else if (rolesUpper.includes('ADMINISTRADOR') || rolesUpper.includes('ADMIN')) {
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
      } catch (_) {}
      alert('Error en registro: ' + message);
      return;
    }

    alert('Registro exitoso. Redirigiendo...');
    signUpForm.reset();

    // Luego iniciar sesión y redirigir según rol
    await login(email, contraseña, true);

  } catch (error) {
    alert('Error al conectar con el servidor');
    console.error(error);
  }
}

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
