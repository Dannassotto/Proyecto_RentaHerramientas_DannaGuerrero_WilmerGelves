async function cargarResumen() {
  const res = await fetch('/api/reportes/resumen');
  const data = await res.json();
  const resumenDiv = document.getElementById('resumen');
  resumenDiv.innerHTML = `
    <div class="card"><h3>Total Herramientas</h3><p>${data.totalHerramientas}</p></div>
    <div class="card"><h3>Reservas Activas</h3><p>${data.reservasActivas}</p></div>
    <div class="card"><h3>Herramientas Dañadas</h3><p>${data.herramientasDanadas}</p></div>
    <div class="card"><h3>Ingresos Totales</h3><p>$${data.ingresosTotales}</p></div>
  `;
}

async function cargarGraficos() {
  const [usoRes, rentabilidadRes] = await Promise.all([
    fetch('/api/reportes/uso'),
    fetch('/api/reportes/rentabilidad')
  ]);
  const usoData = await usoRes.json();
  const rentabilidadData = await rentabilidadRes.json();

  new Chart(document.getElementById('graficoUso'), {
    type: 'bar',
    data: {
      labels: usoData.map(e => e.nombre),
      datasets: [{
        label: 'Veces alquilada',
        data: usoData.map(e => e.cantidad),
        backgroundColor: '#4e73df'
      }]
    }
  });

  new Chart(document.getElementById('graficoRentabilidad'), {
    type: 'pie',
    data: {
      labels: rentabilidadData.map(e => e.nombre),
      datasets: [{
        label: 'Ingresos',
        data: rentabilidadData.map(e => e.ingresos),
        backgroundColor: ['#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
      }]
    }
  });
}

async function cargarTablaRentabilidad() {
  const res = await fetch('/api/reportes/rentabilidad');
  const data = await res.json();
  const tbody = document.querySelector('#tablaRentables tbody');
  tbody.innerHTML = data.map(row => `
    <tr>
      <td>${row.nombre}</td>
      <td>${row.cantidad}</td>
      <td>$${row.ingresos}</td>
    </tr>
  `).join('');
}

async function cargarReportes() {
  await cargarResumen();
  await cargarGraficos();
  await cargarTablaRentabilidad();
}

window.onload = cargarReportes;
