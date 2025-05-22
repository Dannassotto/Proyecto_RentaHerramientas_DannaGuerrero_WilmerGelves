
const rentals = [
  { tool: 'Taladro Percutor', start: '2025-05-15', end: '2025-05-20', status: 'Activo' },
  { tool: 'Sierra Circular', start: '2025-04-10', end: '2025-04-15', status: 'Finalizado' },
  { tool: 'Lijadora Eléctrica', start: '2025-05-01', end: '2025-05-05', status: 'Cancelado' }
];

const rentalsList = document.getElementById('rentals-list');

function renderRentals(list) {
  rentalsList.innerHTML = '';
  list.forEach(rental => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Herramienta">${rental.tool}</td>
      <td data-label="Fecha de Inicio">${rental.start}</td>
      <td data-label="Fecha de Fin">${rental.end}</td>
      <td data-label="Estado">${rental.status}</td>
      <td data-label="Acciones">
        <button onclick="alert('Detalles de ${rental.tool}')">Ver Detalles</button>
      </td>
    `;
    rentalsList.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderRentals(rentals);
});
