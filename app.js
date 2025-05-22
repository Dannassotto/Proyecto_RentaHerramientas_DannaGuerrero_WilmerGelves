
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear JSON en peticiones POST
app.use(express.json());

// Ruta principal (Login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para cliente
app.get('/cliente/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cliente', 'inicio.html'));
});
app.get('/cliente/herramientas', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cliente', 'herramientas.html'));
});

app.get('/cliente/alquileres', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cliente', 'alquileres.html'));
});

app.get('/cliente/pagos', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cliente', 'pagos.html'));
});

app.get('/cliente/soporte', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cliente', 'soporte.html'));
});
app.get('/cliente/perfil', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cliente', 'perfil.html'));
});


// Rutas para administrador
app.get('/administrador/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'administrador', 'dashboard.html'));
});
app.get('/administrador/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'administrador', 'user.html'));
});
app.get('/administrador/pagos', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'administrador', 'pagos.html'));
});
app.get('/administrador/alquileres', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'administrador', 'historial-alquileres.html'));
});
app.get('/administrador/devoluciones', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'administrador', 'devoluciones.html'));
});
app.get('/administrador/incidencias', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'administrador', 'incidencias.html'));
});
app.get('/administrador/reportes', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'administrador', 'reportes.html'));
});
app.get('/administrador/configuracion', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'administrador', 'configuracion.html'));
});

// Ruta para proveedor
app.get('/proveedor/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'proveedor', 'inicio.html'));
});

app.get('/proveedor/herramientas', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'proveedor', 'herramientas.html'));
});
app.get('/proveedor/reservas', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'proveedor', 'reservas.html'));
});

app.get('/proveedor/facturacion', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'proveedor', 'facturacion.html'));
});
app.get('/proveedor/notificaciones', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'proveedor', 'notificaciones.html'));
});




// Simulación de login (pruebas)
app.post('/api/login', (req, res) => {
  const { userName, password } = req.body;

  // Usuarios simulados
  const usuarios = [
    { userName: 'admin@mail.com', password: '1234', rol: 'ADMIN', token: 'tokenAdmin123' },
    { userName: 'cliente@mail.com', password: '1234', rol: 'CLIENTE', token: 'tokenCliente456' },
    { userName: 'proveedor@mail.com', password: '1234', rol: 'PROVEEDOR', token: 'tokenProveedor789' }
  ];

  const user = usuarios.find(u => u.userName === userName && u.password === password);

  if (user) {
    res.json({ token: user.token, rol: user.rol, nombre: 'Usuario de prueba' });
  } else {
    res.status(401).send('Usuario o contraseña incorrectos');
  }
});

// Puerto y escucha
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT} (accesible en red local)`);
});
