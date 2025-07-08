import elements from "./mi-plan.elements.js";
import { DIAS_SEMANA, TIPOS_COMIDA } from "./mi-plan.constants.js";
import {
  initFirestore,
  getRecetasCollection,
  getEntrenamientosCollection,
} from "./mi-plan.firebase.js";
import {
  loadUserPlan,
  assignItemToDay,
  removeItemFromDay,
  getCurrentPlan,
  setCurrentPlan,
} from "./mi-plan.crud.js";
import {
  getCurrentWeekRange,
  calculateNutritionTotals,
} from "./mi-plan.utils.js";
import {
  renderWeekGrid,
  renderRecetasList,
  renderEntrenamientosList,
} from "./mi-plan.render.js";

// Estado global
let currentWeek = getCurrentWeekRange();
let currentUserId = "user123"; // Esto debería venir de tu sistema de autenticación

// Inicialización
async function init() {
  try {
    const firestoreInitialized = await initFirestore();
    if (!firestoreInitialized) {
      console.error(
        "No se pudo inicializar Firebase. La aplicación no funcionará correctamente."
      );
      // Aquí podrías mostrar un mensaje al usuario o fallback
      return;
    }
    await loadInitialData();
    setupEventListeners();
  } catch (error) {
    console.error("Error inicializando Mi Plan:", error);
  }
}

async function loadInitialData() {
  const plan = await loadUserPlan(currentUserId);
  setCurrentPlan(plan); // Asegura que el plan global en crud.js esté actualizado
  renderWeekGrid(plan, currentWeek);
  updateNutritionTotals(plan);

  // Cargar recetas y entrenamientos para el sidebar
  const recetas = await loadRecetas();
  const entrenamientos = await loadEntrenamientos();

  renderRecetasList(recetas);
  renderEntrenamientosList(entrenamientos);
}

// --- Nuevas funciones para cargar recetas y entrenamientos ---
async function loadRecetas() {
  try {
    const recetas = await getRecetasCollection();
    // Aquí podrías agregar lógica de filtrado o procesamiento si es necesario
    return recetas;
  } catch (error) {
    console.error("Error cargando recetas:", error);
    return [];
  }
}

async function loadEntrenamientos() {
  try {
    const entrenamientos = await getEntrenamientosCollection();
    // Aquí podrías agregar lógica de filtrado o procesamiento si es necesario
    return entrenamientos;
  } catch (error) {
    console.error("Error cargando entrenamientos:", error);
    return [];
  }
}
// -----------------------------------------------------------

function setupEventListeners() {
  // Navegación semanal
  elements.prevWeek.addEventListener("click", () => {
    // Lógica para ir a la semana anterior
    console.log("Navegar a semana anterior");
    // Esto es un placeholder. Necesitarías una lógica para calcular la semana anterior
    // y luego volver a cargar los datos y renderizar.
    // currentWeek = calculatePreviousWeek(currentWeek);
    // loadInitialData();
  });

  elements.nextWeek.addEventListener("click", () => {
    // Lógica para ir a la semana siguiente
    console.log("Navegar a semana siguiente");
    // currentWeek = calculateNextWeek(currentWeek);
    // loadInitialData();
  });

  // Funcionalidad de Drag and Drop
  elements.semanaGrid.addEventListener("dragover", (e) => {
    e.preventDefault(); // Permite el drop
    const slot = e.target.closest(".slot");
    if (slot) {
      slot.classList.add("drag-over");
    }
  });

  elements.semanaGrid.addEventListener("dragleave", (e) => {
    const slot = e.target.closest(".slot");
    if (slot) {
      slot.classList.remove("drag-over");
    }
  });

  elements.semanaGrid.addEventListener("drop", async (e) => {
    e.preventDefault();
    const slot = e.target.closest(".slot");
    if (!slot) return;

    slot.classList.remove("drag-over");

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const dayId = slot.dataset.dia;
      const slotType = slot.dataset.tipo; // "desayuno", "almuerzo", etc., o "entrenamiento"

      // Obtener el plan actualizado después de asignar el elemento
      const updatedPlan = await assignItemToDay(dayId, slotType, data);

      // Volver a renderizar la semana completa con el plan actualizado
      renderWeekGrid(updatedPlan, currentWeek);
      updateNutritionTotals(updatedPlan);
    } catch (error) {
      console.error("Error en drop:", error);
    }
  });

  // Event listener para eliminar elementos del plan (delegación)
  elements.semanaGrid.addEventListener("click", async (e) => {
    if (e.target.classList.contains("btn-remove")) {
      const slotContent = e.target.closest(".slot-content");
      if (!slotContent) return;

      const itemId = slotContent.dataset.id;
      const slot = e.target.closest(".slot");
      const dayId = slot.dataset.dia;
      const slotType = slot.dataset.tipo;

      if (
        confirm("¿Estás seguro de que quieres eliminar este elemento del plan?")
      ) {
        try {
          const updatedPlan = await removeItemFromDay(dayId, slotType, itemId);
          renderWeekGrid(updatedPlan, currentWeek);
          updateNutritionTotals(updatedPlan);
        } catch (error) {
          console.error("Error al intentar eliminar elemento:", error);
        }
      }
    }
  });

  // Modal de estadísticas
  elements.btnEstadisticas.addEventListener("click", () => {
    elements.modalEstadisticas.style.display = "block";
    renderStats();
  });

  elements.closeEstadisticas.addEventListener("click", () => {
    elements.modalEstadisticas.style.display = "none";
  });

  // Manejo de pestañas en el sidebar
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.dataset.tab;

      // Desactivar todas las pestañas y contenidos
      document
        .querySelectorAll(".tab-btn")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      // Activar la pestaña y el contenido correctos
      button.classList.add("active");
      document.getElementById(`${tabName}-tab`).classList.add("active");
    });
  });

  // Funcionalidad de búsqueda (simple, se puede mejorar)
  elements.buscarRecetas.addEventListener("input", async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const allRecetas = await loadRecetas();
    const filteredRecetas = allRecetas.filter((receta) =>
      receta.nombre.toLowerCase().includes(searchTerm)
    );
    renderRecetasList(filteredRecetas);
  });

  elements.buscarEntrenamientos.addEventListener("input", async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const allEntrenamientos = await loadEntrenamientos();
    const filteredEntrenamientos = allEntrenamientos.filter((ent) =>
      ent.nombre.toLowerCase().includes(searchTerm)
    );
    renderEntrenamientosList(filteredEntrenamientos);
  });
}

function updateNutritionTotals(plan) {
  const totals = calculateNutritionTotals(plan);
  elements.totalCalorias.textContent = totals.calorias;
  elements.totalProteinas.textContent = `${totals.proteinas}g`;
  elements.totalCarbohidratos.textContent = `${totals.carbohidratos}g`;
  elements.totalGrasas.textContent = `${totals.grasas}g`;
}

function renderStats() {
  // Implementar renderizado de gráficas/estadísticas detalladas
  elements.statsGrid.innerHTML = `
    <p>Estadísticas aquí (aún no implementado).</p>
    <p>Calorías semanales: ${
      calculateNutritionTotals(getCurrentPlan()).calorias
    }</p>
    <p>Proteínas semanales: ${
      calculateNutritionTotals(getCurrentPlan()).proteinas
    }g</p>
  `;
}

// Iniciar la aplicación
init();
