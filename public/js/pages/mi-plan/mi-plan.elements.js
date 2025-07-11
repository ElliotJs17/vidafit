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
  currentWeek: document.getElementById("current-week") || null,
  prevWeek: document.getElementById("prev-week") || null,
  nextWeek: document.getElementById("next-week") || null,

  //Botones de recetas y elements 
  btnAgregarRecetas: document.getElementById("btn-agregar-recetas"),
  btnAgregarEntrenamientos: document.getElementById("btn-agregar-entrenamientos"),
   btnEstadisticas: document.getElementById("btn-estadisticas"),


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
