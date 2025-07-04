// 📁 public/js/pages/entrenamientos/managers/FilterManager.js
// ✅ Manejo de filtros
export class FilterManager {
  constructor() {
    this.filtroActual = "todos";
  }

  // ✅ Aplicar filtro
  aplicarFiltro(tipo) {
    this.filtroActual = tipo;
    this.actualizarBotonesActivos(tipo);
    this.filtrarTarjetas(tipo);
  }

  // ✅ Actualizar botones activos
  actualizarBotonesActivos(tipo) {
    document.querySelectorAll(".filtro-btn").forEach((btn) => {
      btn.classList.remove("activo");
    });

    const botonActivo = document.querySelector(`[data-tipo="${tipo}"]`);
    if (botonActivo) {
      botonActivo.classList.add("activo");
    }
  }

  // ✅ Filtrar tarjetas
  filtrarTarjetas(tipo) {
    document.querySelectorAll(".entrenamiento-card").forEach((card) => {
      const tipoEntrenamiento = card.dataset.tipo?.toLowerCase() || "";
      const nombreEntrenamiento = card.querySelector("h3")?.textContent.toLowerCase() || "";

      const mostrar = tipo === "todos" ||
        tipoEntrenamiento.includes(tipo.toLowerCase()) ||
        nombreEntrenamiento.includes(tipo.toLowerCase());

      card.style.display = mostrar ? "block" : "none";
    });
  }

  // ✅ Obtener filtro actual
  obtenerFiltroActual() {
    return this.filtroActual;
  }
}