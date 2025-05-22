const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
document.head.appendChild(script);

let alquileres = [
  { id: 1, cliente: 'Luis Moreno', herramienta: 'Taladro', inicio: '2025-05-15', fin: '2025-05-17', estado: 'Devuelto' },
  { id: 2, cliente: 'María López', herramienta: 'Compresor', inicio: '2025-05-18', fin: '2025-05-20', estado: 'En curso' },
  { id: 3, cliente: 'Carlos Ruiz', herramienta: 'Sierra', inicio: '2025-05-10', fin: '2025-05-13', estado: 'Retrasado' },
];

const tbody = document.getElementById('tablaAlquileres');
const filtroEstado = document.getElementById('filtroEstado');
const buscarCliente = document.getElementById('buscarCliente');

function renderTabla() {
  const filtro = filtroEstado.value;
  const buscar = buscarCliente.value.toLowerCase();

  tbody.innerHTML = '';
  alquileres
    .filter(a =>
      (filtro === '' || a.estado === filtro) &&
      (buscar === '' || a.cliente.toLowerCase().includes(buscar))
    )
    .forEach(alq => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${alq.id}</td>
        <td>${alq.cliente}</td>
        <td>${alq.herramienta}</td>
        <td>${alq.inicio}</td>
        <td>${alq.fin}</td>
        <td>${alq.estado}</td>
        <td>
          <button class="acciones-btn" onclick="generarPDF(${alq.id})">PDF</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
}

filtroEstado.addEventListener('change', renderTabla);
buscarCliente.addEventListener('input', renderTabla);

function generarPDF(id) {
  const alquiler = alquileres.find(a => a.id === id);
  if (!alquiler) return;

  if (!window.jspdf) {
    alert('Cargando jsPDF...');
    setTimeout(() => generarPDF(id), 500);
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor('#e87722');
  doc.text('Resumen de Alquiler', 105, 20, null, null, 'center');

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`ID: ${alquiler.id}`, 20, 40);
  doc.text(`Cliente: ${alquiler.cliente}`, 20, 50);
  doc.text(`Herramienta: ${alquiler.herramienta}`, 20, 60);
  doc.text(`Fecha Inicio: ${alquiler.inicio}`, 20, 70);
  doc.text(`Fecha Fin: ${alquiler.fin}`, 20, 80);
  doc.text(`Estado: ${alquiler.estado}`, 20, 90);

  doc.setDrawColor('#e87722');
  doc.line(20, 95, 190, 95);
  doc.setFontSize(12);
  doc.text('Gracias por usar nuestro servicio.', 105, 110, null, null, 'center');

  doc.save(`Alquiler_${alquiler.id}.pdf`);
}

renderTabla();
