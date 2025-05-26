const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;


app.use(cors({
  origin: ['http://localhost:8080', 'http://192.168.1.87:8080'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
//paginas cliente
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

// Páginas administrador
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

// Páginas proveedor
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


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor frontend corriendo en http://0.0.0.0:${PORT}`);
});
