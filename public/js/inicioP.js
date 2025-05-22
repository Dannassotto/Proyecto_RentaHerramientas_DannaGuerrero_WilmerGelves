const btnToggle = document.getElementById('btn-toggle');
const navbar = document.querySelector('.navbar');

btnToggle.addEventListener('click', () => {
  navbar.classList.toggle('collapsed');
});
