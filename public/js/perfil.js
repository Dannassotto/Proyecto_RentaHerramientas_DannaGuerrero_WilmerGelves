const profileForm = document.getElementById('profileForm');

// Simulación de datos cargados (en la práctica, vienen de backend)
const userData = {
  name: 'Juan Pérez',
  email: 'juan.perez@example.com'
};

// Cargar datos al formulario
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('name').value = userData.name;
  document.getElementById('email').value = userData.email;
});

profileForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!name || !email) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }

  // Aquí iría la llamada al backend para guardar los cambios
  // Por ahora solo simulamos:
  alert('Datos guardados correctamente');
  profileForm.reset();
  // Volver a llenar con datos guardados (simulación)
  document.getElementById('name').value = name;
  document.getElementById('email').value = email;
  document.getElementById('password').value = '';
});
