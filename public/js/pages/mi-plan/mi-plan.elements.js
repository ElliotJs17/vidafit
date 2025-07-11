// Selectores del DOM
const elements = {
  // Sidebar
  sidebar: document.querySelector(".seleccion-sidebar"),
  tabRecetas: document.getElementById("recetas-tab"),
  tabEntrenamientos: document.getElementById("entrenamientos-tab"),
  recetasList: document.getElementById("recetas-list"),
  entrenamientosList: document.getElementById("entrenamientos-list"),
  buscarRecetas: document.getElementById("buscar-recetas"),
  buscarEntrenamientos: document.getElementById("buscar-entrenamientos"),

  // Plan semanal
  semanaGrid: document.getElementById("semana-grid"),
  currentWeek: document.getElementById("current-week"),
  prevWeek: document.getElementById("prev-week"),
  nextWeek: document.getElementById("next-week"),

  // Estadísticas
  btnEstadisticas: document.getElementById("btn-estadisticas"),
  modalEstadisticas: document.getElementById("modal-estadisticas"),
  closeEstadisticas: document.getElementById("close-estadisticas"),
  statsGrid: document.getElementById("stats-grid"),

  // Detalles
  modalDetalles: document.getElementById("modal-detalles"),
  closeDetalles: document.getElementById("close-detalles"),
  detalleTitulo: document.getElementById("detalle-titulo"),
  detalleContenido: document.getElementById("detalle-contenido"),

  // Resumen nutricional
  totalCalorias: document.getElementById("total-calorias"),
  totalProteinas: document.getElementById("total-proteinas"),
  totalCarbohidratos: document.getElementById("total-carbohidratos"),
  totalGrasas: document.getElementById("total-grasas"),

  // Loading
  loadingIndicator: document.createElement("div"),
};

// Configuración del elemento de loading
elements.loadingIndicator.className = "loading-indicator";
elements.loadingIndicator.innerHTML = `
  <div class="spinner"></div>
  <p>Cargando...</p>
`;

export default elements;
