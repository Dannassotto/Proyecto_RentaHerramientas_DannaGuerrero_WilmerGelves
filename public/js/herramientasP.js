


const btnAddTool = document.getElementById("btn-add-tool");
const modal = document.getElementById("modal-tool");
const closeModalBtn = document.getElementById("close-modal");
const form = document.getElementById("tool-form");
const modalTitle = document.getElementById("modal-title");


btnAddTool.addEventListener("click", () => {
  modalTitle.textContent = "Agregar herramienta";
  form.reset();
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
});


closeModalBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }
});

// Manejo del formulario
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Obtener valores
  const name = document.getElementById("tool-name").value;
  const description = document.getElementById("tool-description").value;
  const status = document.getElementById("tool-status").value;
  const availability = document.getElementById("tool-availability").value;
  const image = document.getElementById("tool-image").files[0];

  console.log("Nueva herramienta:", {
    name,
    description,
    status,
    availability,
    image,
  });


  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
});
