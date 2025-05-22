document.addEventListener('DOMContentLoaded', () => {
  // Cambiar pestañas
  const tabs = document.querySelectorAll('.config-sidebar ul li');
  const sections = document.querySelectorAll('.config-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-section');
      sections.forEach(section => {
        section.classList.toggle('active', section.id === target);
      });
    });
  });

  // Cargar tema guardado
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('toggle-theme').checked = true;
  }

  // Cambiar tema
  const toggleTheme = document.getElementById('toggle-theme');
  toggleTheme.addEventListener('change', () => {
    if (toggleTheme.checked) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  });

  // Formulario perfil
  const formPerfil = document.getElementById('form-perfil');
  const perfilMsg = document.getElementById('perfil-msg');

  formPerfil.addEventListener('submit', e => {
    e.preventDefault();

    const nombre = formPerfil.nombre.value.trim();
    const email = formPerfil.email.value.trim();

    if (!nombre || !email) {
      perfilMsg.textContent = 'Por favor completa todos los campos.';
      perfilMsg.style.color = 'red';
      return;
    }

    // Simular guardado con timeout
    perfilMsg.style.color = 'green';
    perfilMsg.textContent = 'Guardando...';

    setTimeout(() => {
      perfilMsg.textContent = 'Perfil actualizado correctamente.';
      formPerfil.reset();
    }, 1200);
  });

  // Formulario seguridad (cambio de contraseña)
  const formSeguridad = document.getElementById('form-seguridad');
  const seguridadMsg = document.getElementById('seguridad-msg');

  formSeguridad.addEventListener('submit', e => {
    e.preventDefault();

    const oldPass = formSeguridad['password-old'].value.trim();
    const newPass = formSeguridad['password-new'].value.trim();
    const confirmPass = formSeguridad['password-confirm'].value.trim();

    if (!oldPass || !newPass || !confirmPass) {
      seguridadMsg.style.color = 'red';
      seguridadMsg.textContent = 'Por favor completa todos los campos.';
      return;
    }

    if (newPass !== confirmPass) {
      seguridadMsg.style.color = 'red';
      seguridadMsg.textContent = 'La nueva contraseña y la confirmación no coinciden.';
      return;
    }

    if (newPass.length < 6) {
      seguridadMsg.style.color = 'red';
      seguridadMsg.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Aquí iría la lógica real para cambiar la contraseña (API, backend)
    seguridadMsg.style.color = 'green';
    seguridadMsg.textContent = 'Actualizando contraseña...';

    setTimeout(() => {
      seguridadMsg.textContent = 'Contraseña actualizada correctamente.';
      formSeguridad.reset();
    }, 1400);
  });
});
