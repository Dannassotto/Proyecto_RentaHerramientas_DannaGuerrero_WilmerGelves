const API_URL = "http://localhost:8080/api/herramienta";
const toolsTableBody = document.getElementById("toolsTableBody");
const modal = document.getElementById("modal-tool");
const closeModalBtn = document.getElementById("close-modal");
const toolForm = document.getElementById("tool-form");
const btnAddTool = document.getElementById("btn-add-tool");
const modalTitle = document.getElementById("modal-title");

// Estado para saber si estamos editando o agregando
let editToolId = null;

// Obtén el id del proveedor logueado (debes guardarlo en localStorage al iniciar sesión)
function getProveedorIdLogueado() {
  return parseInt(localStorage.getItem('proveedorId'));
}

// Mostrar/ocultar modal
function openModal(title = "Agregar herramienta") {
  modalTitle.textContent = title;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  toolForm.reset();
  editToolId = null;
  document.getElementById("tool-id").value = '';
  document.getElementById("tool-provider").value = getProveedorIdLogueado();
}

// Cargar herramientas en la tabla (solo las del proveedor logueado)
async function cargarHerramientas() {
  if (!toolsTableBody) return;
  toolsTableBody.innerHTML = `<tr><td colspan="8">Cargando herramientas...</td></tr>`;
  try {
    const token = localStorage.getItem('token');
    const proveedorId = getProveedorIdLogueado();
    if (!token) {
      toolsTableBody.innerHTML = `<tr><td colspan="8">No autorizado. Inicia sesión.</td></tr>`;
      return;
    }

    const res = await fetch(`${API_URL}/findAll`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (res.status === 401 || res.status === 403) {
      toolsTableBody.innerHTML = `<tr><td colspan="8">No autorizado. Inicia sesión.</td></tr>`;
      return;
    }

    if (!res.ok) throw new Error("Error al obtener herramientas");
    const herramientas = await res.json();

    // Filtra solo las herramientas del proveedor logueado
    const herramientasPropias = herramientas.filter(tool => tool.proveedorHerramienta == proveedorId);

    if (!Array.isArray(herramientasPropias) || herramientasPropias.length === 0) {
      toolsTableBody.innerHTML = `<tr><td colspan="8">No tienes herramientas registradas.</td></tr>`;
      return;
    }

    toolsTableBody.innerHTML = herramientasPropias
      .map(
        (tool) => `
        <tr>
          <td>
            ${
              tool.imagen
                ? `<img src="${tool.imagen}" alt="${tool.nombre}" class="tool-img" />`
                : `<img src="/img/default-tool.png" alt="Sin imagen" class="tool-img" />`
            }
          </td>
          <td>${tool.nombre || '-'}</td>
          <td>${tool.descripcion || '-'}</td>
          <td>${tool.price != null ? tool.price : '-'}</td>
          <td>${tool.stock != null ? tool.stock : '-'}</td>
          <td>${tool.estadoHerramienta || '-'}</td>
          <td>${tool.proveedorHerramienta || '-'}</td>
          <td>
            <button class="btn-edit" type="button" data-id="${tool.id}">Editar</button>
            <button class="btn-delete" type="button" data-id="${tool.id}">Eliminar</button>
          </td>
        </tr>
      `
      )
      .join("");

    // Listeners para editar
    toolsTableBody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await cargarHerramientaEnModal(id);
      });
    });

    // Listeners para eliminar
    toolsTableBody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('¿Seguro que deseas eliminar la herramienta?')) {
          await eliminarHerramienta(id);
          cargarHerramientas();
        }
      });
    });

  } catch (error) {
    toolsTableBody.innerHTML = `<tr><td colspan="8">Error al cargar herramientas.</td></tr>`;
    console.error("Error al cargar herramientas:", error);
  }
}

// Cargar datos de una herramienta en el modal para editar
async function cargarHerramientaEnModal(id) {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/find/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error("No se pudo cargar la herramienta");
    const tool = await res.json();

    document.getElementById("tool-id").value = tool.id || '';
    document.getElementById("tool-name").value = tool.nombre || '';
    document.getElementById("tool-description").value = tool.descripcion || '';
    document.getElementById("tool-price").value = tool.price != null ? tool.price : '';
    document.getElementById("tool-stock").value = tool.stock != null ? tool.stock : '';
    document.getElementById("tool-status").value = tool.estadoHerramienta || '';
    document.getElementById("tool-provider").value = getProveedorIdLogueado();

    editToolId = id;
    openModal("Editar herramienta");
  } catch (error) {
    alert("Error al cargar la herramienta para editar");
    console.error(error);
  }
}

// Eliminar herramienta
async function eliminarHerramienta(id) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_URL}/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      alert('Error al eliminar la herramienta');
    }
  } catch (error) {
    alert('Error al eliminar la herramienta');
    console.error(error);
  }
}

// Guardar (agregar o editar) herramienta
toolForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const id = document.getElementById("tool-id").value;
  const nombre = document.getElementById("tool-name").value.trim();
  const descripcion = document.getElementById("tool-description").value.trim();
  const price = parseFloat(document.getElementById("tool-price").value) || 0;
  const stock = parseInt(document.getElementById("tool-stock").value) || 0;
  const estadoHerramienta = parseInt(document.getElementById("tool-status").value);
  const proveedorHerramienta = getProveedorIdLogueado();
  document.getElementById("tool-provider").value = proveedorHerramienta; // Asegura que el campo oculto esté lleno
  const imagenInput = document.getElementById("tool-image");
  let imagen = "";
  if (imagenInput.files && imagenInput.files[0]) {
    imagen = imagenInput.files[0].name;
  }

  const herramientaDTO = {
    nombre,
    descripcion,
    price,
    imagen,
    stock,
    estadoHerramienta,
    proveedorHerramienta
  };

  try {
    let res;
    if (id) {
      // Editar
      res = await fetch(`${API_URL}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(herramientaDTO)
      });
    } else {
      // Agregar
      res = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(herramientaDTO)
      });
    }

    if (!res.ok) {
      const errorText = await res.text();
      alert('Error: ' + errorText);
      return;
    }

    closeModal();
    cargarHerramientas();
  } catch (error) {
    alert('Error al guardar la herramienta');
    console.error(error);
  }
});

// Abrir modal para agregar
btnAddTool.addEventListener('click', () => {
  toolForm.reset();
  document.getElementById("tool-id").value = '';
  editToolId = null;
  document.getElementById("tool-provider").value = getProveedorIdLogueado();
  openModal("Agregar herramienta");
});

// Cerrar modal
closeModalBtn.addEventListener('click', closeModal);

// Cargar herramientas al iniciar
document.addEventListener("DOMContentLoaded", cargarHerramientas);