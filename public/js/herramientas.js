const toolCardsContainer = document.getElementById("tool-cards");
const toolSearchInput = document.getElementById("search-tools");

// Lista de herramientas
const tools = [
  { name: 'Taladro Percutor', desc: 'Ideal para concreto', img: 'https://i.imgur.com/7SxZcX6.png' },
  { name: 'Mezcladora de Cemento', desc: 'Perfecta para obras', img: 'https://i.imgur.com/2z17yCP.png' },
  { name: 'Sierra Circular', desc: 'Corte rápido y seguro', img: 'https://i.imgur.com/Bctf6vN.png' },
  { name: 'Lijadora Eléctrica', desc: 'Acabados profesionales', img: 'https://i.imgur.com/EXWVbcG.png' },
];

// Mostrar herramientas (puede recibir un filtro)
function mostrarHerramientas(filtradas = tools) {
  toolCardsContainer.innerHTML = '';

  if (filtradas.length === 0) {
    toolCardsContainer.innerHTML = '<p>No se encontraron herramientas.</p>';
    return;
  }

  filtradas.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.innerHTML = `
      <img src="${tool.img}" alt="${tool.name}" />
      <h4>${tool.name}</h4>
      <p>${tool.desc}</p>
      <button>Ver más</button>
    `;
    toolCardsContainer.appendChild(card);
  });
}

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarHerramientas();
});

// Evento filtro búsqueda
toolSearchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filtradas = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm) ||
    tool.desc.toLowerCase().includes(searchTerm)
  );
  mostrarHerramientas(filtradas);
});
