const ticketForm = document.getElementById('ticketForm');
const ticketsContainer = document.getElementById('ticketsContainer');

// Lista simulada de tickets (en app real viene del backend)
let tickets = [];

function renderTickets() {
  ticketsContainer.innerHTML = '';
  if (tickets.length === 0) {
    ticketsContainer.innerHTML = '<p>No tienes tickets abiertos.</p>';
    return;
  }
  tickets.forEach((ticket, i) => {
    const div = document.createElement('div');
    div.classList.add('ticket');
    div.style.border = '1px solid #d87325';
    div.style.padding = '10px';
    div.style.marginBottom = '10px';
    div.innerHTML = `
      <strong>${ticket.subject}</strong>
      <p>${ticket.description}</p>
      <small>Estado: ${ticket.status}</small>
    `;
    ticketsContainer.appendChild(div);
  });
}

ticketForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const description = document.getElementById('description').value.trim();
  if (!subject || !description) return alert('Completa todos los campos');
  tickets.push({ subject, description, status: 'Abierto' });
  ticketForm.reset();
  renderTickets();
});

// Mostrar tickets inicialmente
renderTickets();
