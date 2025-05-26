document.addEventListener("DOMContentLoaded", () => {
    cargarReportes();
});

const API_BASE = "http://localhost:8080/api/reporte";

function mostrarNotificacion(mensaje, tipo = "info") {
    let contenedor = document.getElementById("notificaciones");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "notificaciones";
        document.body.appendChild(contenedor);
    }

    const notificacion = document.createElement("div");
    notificacion.textContent = mensaje;
    notificacion.className = `notificacion ${tipo}`;
    contenedor.appendChild(notificacion);

    setTimeout(() => {
        contenedor.removeChild(notificacion);
    }, 3000);
}

async function cargarReportes() {
    const token = localStorage.getItem("token");
    if (!token) {
        mostrarNotificacion("No autorizado. Por favor, inicia sesión.", "error");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/findAll`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            if (res.status === 401) {
                mostrarNotificacion("No autorizado. Token inválido o expirado.", "error");
            } else {
                mostrarNotificacion("Error al obtener los reportes.", "error");
            }
            return;
        }

        const data = await res.json();
        mostrarReportesEnTabla(data);
    } catch (error) {
        console.error("Error al cargar reportes:", error);
        mostrarNotificacion("Error de conexión con el servidor.", "error");
    }
}
