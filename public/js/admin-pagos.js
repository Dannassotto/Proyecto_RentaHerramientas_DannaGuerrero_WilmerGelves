
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
document.head.appendChild(script);

let pagos = [
  { id: 1, cliente: 'Juan Pérez', monto: 150000, fecha: '2025-05-20', estado: 'Pagado' },
  { id: 2, cliente: 'Ana Gómez', monto: 85000, fecha: '2025-05-19', estado: 'Pendiente' },
];

let editMode = false;
let editId = null;

const form = document.getElementById('pagoForm');
const tbody = document.getElementById('pagosTableBody');

function mostrarNotificacion(msg) {
  const container = document.getElementById('notificaciones');
  const toast = document.createElement('div');
  toast.classList.add('toast');
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function renderPagos() {
  tbody.innerHTML = '';
  pagos.forEach(pago => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pago.id}</td>
      <td>${pago.cliente}</td>
      <td>$${pago.monto.toLocaleString()}</td>
      <td>${pago.fecha}</td>
      <td>${pago.estado}</td>
      <td>
        <button class="actions-btn" onclick="editarPago(${pago.id})">Editar</button>
        <button class="actions-btn" onclick="generarPDF(${pago.id})">PDF</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function agregarPago(pago) {
  pago.id = pagos.length ? pagos[pagos.length - 1].id + 1 : 1;
  pagos.push(pago);
}

function editarPago(id) {
  editMode = true;
  editId = id;
  const pago = pagos.find(p => p.id === id);
  if (!pago) return;

  document.getElementById('cliente').value = pago.cliente;
  document.getElementById('monto').value = pago.monto;
  document.getElementById('fecha').value = pago.fecha;
  document.getElementById('estado').value = pago.estado;
  document.getElementById('editMode').value = 'true';
  form.querySelector('button[type="submit"]').textContent = 'Actualizar';
}

function actualizarPago(pagoActualizado) {
  pagos = pagos.map(p => (p.id === editId ? { ...pagoActualizado, id: editId } : p));
  editMode = false;
  editId = null;
  document.getElementById('editMode').value = 'false';
  form.querySelector('button[type="submit"]').textContent = 'Guardar';
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const cliente = document.getElementById('cliente').value.trim();
  const monto = Number(document.getElementById('monto').value);
  const fecha = document.getElementById('fecha').value;
  const estado = document.getElementById('estado').value;

  if (!cliente || !monto || !fecha || !estado) {
    mostrarNotificacion('Por favor, complete todos los campos');
    return;
  }

  const pago = { cliente, monto, fecha, estado };

  if (editMode) {
    actualizarPago(pago);
    mostrarNotificacion('Pago actualizado');
  } else {
    agregarPago(pago);
    mostrarNotificacion('Pago agregado');
  }

  form.reset();
  renderPagos();
});

function generarPDF(id) {
  const pago = pagos.find(p => p.id === id);
  if (!pago) return;

  if (!window.jspdf) {
    mostrarNotificacion('Espere un momento, cargando librería PDF...');
    setTimeout(() => generarPDF(id), 500);
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.setTextColor('#e87722');
  doc.text('Factura de Pago', 105, 20, null, null, 'center');

  doc.setFontSize(16);
  doc.setTextColor(0);

  doc.text(`ID Pago: ${pago.id}`, 20, 50);
  doc.text(`Cliente: ${pago.cliente}`, 20, 65);
  doc.text(`Monto: $${pago.monto.toLocaleString()}`, 20, 80);
  doc.text(`Fecha: ${pago.fecha}`, 20, 95);
  doc.text(`Estado: ${pago.estado}`, 20, 110);

  doc.setDrawColor('#e87722');
  doc.setLineWidth(0.5);
  doc.line(20, 115, 190, 115);

  doc.setFontSize(12);
  doc.text('Gracias por su pago.', 105, 130, null, null, 'center');

  doc.save(`Factura_Pago_${pago.id}.pdf`);
}

renderPagos();
