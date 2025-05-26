const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
document.head.appendChild(script);

let devoluciones = [
  { id: 1, cliente: "Laura Gómez", herramienta: "Martillo eléctrico", fin: "2025-05-20", estado: "En curso" },
  { id: 2, cliente: "Andrés Díaz", herramienta: "Lijadora", fin: "2025-05-19", estado: "En curso" }
];

const tbody = document.getElementById("tablaDevoluciones");

function renderTabla() {
  tbody.innerHTML = '';
  devoluciones.forEach(d => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.id}</td>
      <td>${d.cliente}</td>
      <td>${d.herramienta}</td>
      <td>${d.fin}</td>
      <td>${d.estado}</td>
      <td>
        <button class="acciones-btn" onclick="marcarDevuelto(${d.id})">Marcar Devuelto</button>
        <button class="acciones-btn" onclick="generarPDF(${d.id})">PDF</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function marcarDevuelto(id) {
  const dev = devoluciones.find(d => d.id === id);
  if (dev) {
    dev.estado = "Devuelto";
    mostrarNotificacion(`Alquiler #${id} marcado como devuelto.`);
    renderTabla();
  }
}

function generarPDF(id) {
  const dev = devoluciones.find(d => d.id === id);
  if (!dev) return;

  if (!window.jspdf) {
    alert('Cargando jsPDF...');
    setTimeout(() => generarPDF(id), 500);
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor('#e87722');
  doc.text('Comprobante de Devolución', 105, 20, null, null, 'center');

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`ID: ${dev.id}`, 20, 40);
  doc.text(`Cliente: ${dev.cliente}`, 20, 50);
  doc.text(`Herramienta: ${dev.herramienta}`, 20, 60);
  doc.text(`Fecha Fin: ${dev.fin}`, 20, 70);
  doc.text(`Estado: ${dev.estado}`, 20, 80);

  doc.setFontSize(12);
  doc.text('¡Gracias por devolver la herramienta!', 105, 100, null, null, 'center');

  doc.save(`Devolucion_${dev.id}.pdf`);
}

function mostrarNotificacion(mensaje) {
  const contenedor = document.getElementById("notificaciones");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = mensaje;
  contenedor.appendChild(toast);
  setTimeout(() => contenedor.removeChild(toast), 3000);
}

renderTabla();
