function abrirModal() {
  document.getElementById("modal-notificacion").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modal-notificacion").classList.add("hidden");
}

document.getElementById("form-notificacion").addEventListener("submit", function(e) {
  e.preventDefault();

  
  cerrarModal();

  
  alert("Notificación enviada correctamente");
});
