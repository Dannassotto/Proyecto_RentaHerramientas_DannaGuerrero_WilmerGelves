document.addEventListener('DOMContentLoaded', () => {
  const btnNuevaReserva = document.getElementById('btn-nueva-reserva');
  const modal = document.getElementById('modal-reserva');
  const closeModal = document.getElementById('close-modal');
  const form = document.getElementById('reserva-form');
  const tablaReservas = document.querySelector('.reservas-table tbody');

  btnNuevaReserva.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    form.reset();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      form.reset();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const cliente = form.cliente.value.trim();
    const herramienta = form.herramienta.value.trim();
    const fechaInicio = form['fecha-inicio'].value;
    const fechaFin = form['fecha-fin'].value;

    if (fechaFin < fechaInicio) {
      alert('La fecha fin no puede ser anterior a la fecha inicio.');
      return;
    }

    const idReserva = (tablaReservas.rows.length + 1).toString().padStart(3, '0');

    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
      <td>${idReserva}</td>
      <td>${cliente}</td>
      <td>${herramienta}</td>
      <td>${fechaInicio}</td>
      <td>${fechaFin}</td>
      <td>Pendiente</td>
      <td>
        <button class="btn-edit">Editar</button>
        <button class="btn-cancel">Cancelar</button>
        <button class="btn-confirm">Confirmar</button>
      </td>
    `;

    tablaReservas.appendChild(nuevaFila);

    modal.classList.add('hidden');
    form.reset();

    alert('Reserva creada exitosamente (demo).');
  });

  tablaReservas.addEventListener('click', (e) => {
    const fila = e.target.closest('tr');
    if (!fila) return;

    if (e.target.classList.contains('btn-cancel')) {
      if (confirm('¿Seguro que quieres cancelar esta reserva?')) {
        fila.querySelector('td:nth-child(6)').textContent = 'Cancelada';
      }
    } else if (e.target.classList.contains('btn-confirm')) {
      fila.querySelector('td:nth-child(6)').textContent = 'Confirmada';
    } else if (e.target.classList.contains('btn-edit')) {
      alert('Funcionalidad de edición no implementada en esta demo.');
    }
  });
});
