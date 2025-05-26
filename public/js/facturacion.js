document.addEventListener("DOMContentLoaded", () => {
  const abrirModalBtn = document.getElementById("btn-abrir-factura");
  const modal = document.getElementById("modal-factura");
  const cerrarModalBtn = document.getElementById("cerrar-modal-factura");
  const form = document.getElementById("form-factura");
  const tabla = document.querySelector("#tabla-facturas tbody");

  let facturas = [];
  let editandoIndex = null;

  function abrirModal() {
    modal.classList.remove("hidden");
    form.reset();
    editandoIndex = null;
  }

  function cerrarModal() {
    modal.classList.add("hidden");
    form.reset();
  }

  function renderTabla() {
    tabla.innerHTML = "";
    facturas.forEach((factura, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${factura.numero}</td>
        <td>${factura.fecha}</td>
        <td>${factura.cliente}</td>
        <td>$${factura.monto}</td>
        <td>${factura.estado}</td>
        <td>
          <button class="action-btn" onclick="editarFactura(${index})">Editar</button>
          <button class="action-btn" onclick="eliminarFactura(${index})">Eliminar</button>
        </td>
      `;
      tabla.appendChild(fila);
    });
  }

  window.editarFactura = (index) => {
    const factura = facturas[index];
    document.getElementById("numero-factura").value = factura.numero;
    document.getElementById("fecha-factura").value = factura.fecha;
    document.getElementById("cliente-factura").value = factura.cliente;
    document.getElementById("monto-factura").value = factura.monto;
    document.getElementById("estado-factura").value = factura.estado;

    editandoIndex = index;
    abrirModal();
  };

  window.eliminarFactura = (index) => {
    if (confirm("¿Deseas eliminar esta factura?")) {
      facturas.splice(index, 1);
      renderTabla();
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nuevaFactura = {
      numero: form["numero-factura"].value,
      fecha: form["fecha-factura"].value,
      cliente: form["cliente-factura"].value,
      monto: form["monto-factura"].value,
      estado: form["estado-factura"].value,
    };

    if (editandoIndex !== null) {
      facturas[editandoIndex] = nuevaFactura;
    } else {
      facturas.push(nuevaFactura);
    }

    cerrarModal();
    renderTabla();
  });

  abrirModalBtn.addEventListener("click", abrirModal);
  cerrarModalBtn.addEventListener("click", cerrarModal);
});
