
const payments = [
  { id: 1, date: '2025-05-10', amount: 120000, status: 'Pagado', method: 'Tarjeta' },
  { id: 2, date: '2025-04-22', amount: 85000, status: 'Pendiente', method: 'Efectivo' },
  { id: 3, date: '2025-05-05', amount: 50000, status: 'Cancelado', method: 'Transferencia' }
];

const paymentsList = document.getElementById('payments-list');

function renderPayments(list) {
  paymentsList.innerHTML = '';
  list.forEach(payment => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="ID Pago">${payment.id}</td>
      <td data-label="Fecha">${payment.date}</td>
      <td data-label="Monto">$${payment.amount.toLocaleString()}</td>
      <td data-label="Estado">${payment.status}</td>
      <td data-label="Método">${payment.method}</td>
      <td data-label="Acciones">
        <button onclick="alert('Ver detalles del pago ID ${payment.id}')">Ver Detalles</button>
      </td>
    `;
    paymentsList.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPayments(payments);
});
