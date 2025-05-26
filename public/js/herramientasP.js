
const API_URL = "http://localhost:8080/api/herramienta";
const toolsTableBody = document.getElementById("toolsTableBody");

/**
 * Carga las herramientas desde la API y las muestra en la tabla.
 */
async function cargarHerramientas() {
  if (!toolsTableBody) return;
  toolsTableBody.innerHTML = `<tr><td colspan="6">Cargando herramientas...</td></tr>`;
  try {
    const res = await fetch(`${API_URL}/findAll`);
    if (!res.ok) throw new Error("Error al obtener herramientas");
    const herramientas = await res.json();

    if (!Array.isArray(herramientas) || herramientas.length === 0) {
      toolsTableBody.innerHTML = `<tr><td colspan="6">No hay herramientas registradas.</td></tr>`;
      return;
    }

    toolsTableBody.innerHTML = herramientas
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
          <td>${tool.estado || '-'}</td>
          <td>${tool.disponibilidad || '-'}</td>
          <td>
            <button class="btn-edit" type="button" data-id="${tool.id}">Editar</button>
            <button class="btn-delete" type="button" data-id="${tool.id}">Eliminar</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    toolsTableBody.innerHTML = `<tr><td colspan="6">Error al cargar herramientas.</td></tr>`;
    console.error("Error al cargar herramientas:", error);
  }
}

// Llama la función al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarHerramientas();
});
