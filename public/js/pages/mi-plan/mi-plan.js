import elements from "./mi-plan.elements.js";
import { DIAS_SEMANA, TIPOS_COMIDA } from "./mi-plan.constants.js";
import { initCalendar } from "./calendar-init.js";
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
  getWeekRange,
  calculateNutritionTotals,
  showError,
  showSuccess,
  makeDraggable,
} from "./mi-plan.utils.js";
import {
  renderWeekGrid,
  renderRecetasList,
  renderEntrenamientosList,
} from "./mi-plan.render.js";

// Estado global
let currentWeek = getWeekRange();
let currentUserId = null;

// Inicialización
async function init() {
  try {
    // Obtener usuario autenticado (debes implementar esta función según tu auth system)
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = "/index.html"; // Redirige si no hay usuario
      return;
    }
    currentUserId = user.uid;

    const firestoreInitialized = await initFirestore();
    if (!firestoreInitialized) {
      showError("No se pudo conectar con la base de datos");
      return;
    }

    await loadInitialData();
    setupEventListeners();
    initCalendar(); // Inicializar el calendario
  } catch (error) {
    console.error("Error inicializando Mi Plan:", error);
    showError("Ocurrió un error al iniciar la aplicación.");
  }
}

// Función placeholder para obtener el usuario actual
// DEBES IMPLEMENTAR ESTA FUNCIÓN SEGÚN TU SISTEMA DE AUTENTICACIÓN (ej. Firebase Auth)
async function getCurrentUser() {
  // Ejemplo: Podrías usar Firebase Authentication aquí
  // const auth = getAuth();
  // return new Promise((resolve) => {
  //   onAuthStateChanged(auth, (user) => {
  //     resolve(user);
  //   });
  // });
  // Por ahora, un usuario de prueba o una implementación dummy:
  return { uid: "testUser123" }; // <--- Asegúrate de que esto devuelve un objeto con 'uid'
}

async function loadInitialData() {
  try {
    showLoading();
    const plan = await loadUserPlan(currentUserId, currentWeek.id);
    setCurrentPlan(plan);
    renderWeekGrid(plan, currentWeek);
    updateNutritionTotals(plan);

    // Cargar recetas y entrenamientos para el sidebar
    const recetas = await loadRecetas();
    const entrenamientos = await loadEntrenamientos();

    renderRecetasList(recetas);
    renderEntrenamientosList(entrenamientos);
    hideLoading();
  } catch (error) {
    console.error("Error cargando datos iniciales:", error);
    showError("No se pudieron cargar los datos iniciales.");
    hideLoading();
  }
}

async function loadRecetas() {
  try {
    const recetasCollection = await getRecetasCollection();
    // Filtrar y devolver solo las recetas válidas
    return recetasCollection.filter((receta) => receta.id && receta.nombre);
  } catch (error) {
    console.error("Error cargando recetas:", error);
    showError("Error al cargar recetas.");
    return [];
  }
}

async function loadEntrenamientos() {
  try {
    const entrenamientosCollection = await getEntrenamientosCollection();
    // Filtrar y devolver solo los entrenamientos válidos
    return entrenamientosCollection.filter(
      (entrenamiento) => entrenamiento.id && entrenamiento.nombre
    );
  } catch (error) {
    console.error("Error cargando entrenamientos:", error);
    showError("Error al cargar entrenamientos.");
    return [];
  }
}

function setupEventListeners() {
  // Navegación semanal
  elements.prevWeek.addEventListener("click", async () => {
    const prevMonday = new Date(currentWeek.start);
    prevMonday.setDate(prevMonday.getDate() - 7);
    currentWeek = getWeekRange(prevMonday);
    await loadInitialData();
  });

  elements.nextWeek.addEventListener("click", async () => {
    const nextMonday = new Date(currentWeek.start);
    nextMonday.setDate(nextMonday.getDate() + 7);
    currentWeek = getWeekRange(nextMonday);
    await loadInitialData();
  });

  // Event listeners para pestañas del sidebar
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const tab = e.target.dataset.tab;

      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });

      e.target.classList.add("active");
      document.getElementById(`${tab}-tab`).classList.add("active");
    });
  });

  // Event listeners para drag & drop en el plan semanal
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
      const slotType = slot.dataset.tipo;

      if (slotType === "entrenamiento" && data.type !== "entrenamiento") {
        showError(
          "Solo puedes arrastrar entrenamientos a los slots de entrenamiento."
        );
        return;
      }
      if (slotType !== "entrenamiento" && data.type === "entrenamiento") {
        showError("No puedes arrastrar entrenamientos a los slots de comida.");
        return;
      }

      await assignItemToDay(dayId, slotType, data);
      await loadInitialData(); // Recargar datos para reflejar cambios y actualizar totales
      showSuccess("Elemento asignado correctamente.");
    } catch (error) {
      console.error("Error en drop:", error);
      showError("Error al asignar elemento al plan.");
    }
  });

  // Remover elemento del día
  elements.semanaGrid.addEventListener("click", async (e) => {
    const removeBtn = e.target.closest(".btn-remove");
    if (removeBtn) {
      const itemElement = removeBtn.closest(
        ".comida-item, .entrenamiento-item"
      );
      const slotElement = removeBtn.closest(".slot");

      if (!itemElement || !slotElement) return;

      const dayId = slotElement.dataset.dia;
      const slotType = slotElement.dataset.tipo;
      const itemId = itemElement.dataset.id; // Asume que la receta/entrenamiento tiene un ID

      if (confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
        try {
          await removeItemFromDay(dayId, slotType, itemId);
          await loadInitialData();
          showSuccess("Elemento eliminado del plan.");
        } catch (error) {
          console.error("Error eliminando elemento:", error);
          showError("Error al eliminar el elemento.");
        }
      }
    }
  });

  // Búsqueda de recetas y entrenamientos
  elements.buscarRecetas.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const allRecetas = getCurrentPlan().allRecetas || []; // Asume que tienes todas las recetas cargadas
    const filteredRecetas = allRecetas.filter(
      (receta) =>
        receta.nombre.toLowerCase().includes(searchTerm) ||
        receta.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
    renderRecetasList(filteredRecetas);
  });

  elements.buscarEntrenamientos.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const allEntrenamientos = getCurrentPlan().allEntrenamientos || []; // Asume que tienes todos los entrenamientos cargados
    const filteredEntrenamientos = allEntrenamientos.filter(
      (ent) =>
        ent.nombre.toLowerCase().includes(searchTerm) ||
        ent.keywords?.some((kw) => kw.toLowerCase().includes(searchTerm))
    );
    renderEntrenamientosList(filteredEntrenamientos);
  });

  // Modal de estadísticas
  elements.btnEstadisticas.addEventListener("click", () => {
    elements.modalEstadisticas.style.display = "block";
    renderStats();
  });

  elements.closeEstadisticas.addEventListener("click", () => {
    elements.modalEstadisticas.style.display = "none";
  });

  // Modal de detalles
  elements.semanaGrid.addEventListener("click", (e) => {
    const detailBtn = e.target.closest(".btn-detail");
    if (detailBtn) {
      const type = detailBtn.dataset.type;
      const id = detailBtn.dataset.id;
      const plan = getCurrentPlan();
      let item = null;

      if (type === "receta") {
        item = plan.allRecetas?.find((r) => r.id === id);
      } else if (type === "entrenamiento") {
        item = plan.allEntrenamientos?.find((e) => e.id === id);
      }

      if (item) {
        renderDetalleModal(item, type);
        elements.modalDetalles.style.display = "block";
      }
    }
  });

  elements.closeDetalles.addEventListener("click", () => {
    elements.modalDetalles.style.display = "none";
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
  const plan = getCurrentPlan();
  const totals = calculateNutritionTotals(plan);

  elements.statsGrid.innerHTML = `
    <div class="stat-card">
      <h3>Resumen Nutricional</h3>
      <p>Calorías totales: ${totals.calorias}</p>
      <p>Proteínas: ${totals.proteinas}g</p>
      <p>Carbohidratos: ${totals.carbohidratos}g</p>
      <p>Grasas: ${totals.grasas}g</p>
    </div>
    <div class="stat-card">
      <h3>Actividad Física</h3>
      <p>Calorías quemadas: ${totals.caloriasQuemadas || 0}</p>
    </div>
  `;
}

function renderDetalleModal(item, type) {
  elements.detalleTitulo.textContent = item.nombre;
  let content = ``;

  if (type === "receta") {
    content = `
      <img src="${item.imagenUrl || "placeholder.jpg"}" alt="${
      item.nombre
    }" style="width: 100%; max-height: 200px; object-fit: cover; margin-bottom: 15px;">
      <p><strong>Calorías:</strong> ${item.calorias || "N/A"}</p>
      <p><strong>Tiempo de preparación:</strong> ${
        item.tiempoPreparacion || "N/A"
      } min</p>
      <p><strong>Macronutrientes:</strong></p>
      <ul>
        <li>Proteínas: ${item.macronutrientes?.proteinas || 0}g</li>
        <li>Carbohidratos: ${item.macronutrientes?.carbohidratos || 0}g</li>
        <li>Grasas: ${item.macronutrientes?.grasas || 0}g</li>
      </ul>
      <p><strong>Ingredientes:</strong> ${
        item.ingredientes?.join(", ") || "No especificados"
      }</p>
      <p><strong>Instrucciones:</strong> ${
        item.instrucciones || "No especificadas"
      }</p>
      <p><strong>Tags:</strong> ${item.tags?.join(", ") || "Ninguno"}</p>
    `;
  } else if (type === "entrenamiento") {
    content = `
      <p><strong>Duración:</strong> ${item.duracion || "N/A"} min</p>
      <p><strong>Calorías quemadas estimadas:</strong> ${item.calorias || 0}</p>
      <p><strong>Tipo:</strong> ${item.tipo || "N/A"}</p>
      <p><strong>Descripción:</strong> ${
        item.descripcion || "No especificada"
      }</p>
      <p><strong>Keywords:</strong> ${
        item.keywords?.join(", ") || "Ninguno"
      }</p>
    `;
  }
  elements.detalleContenido.innerHTML = content;
}

function showLoading() {
  document.body.appendChild(elements.loadingIndicator);
}

function hideLoading() {
  if (document.body.contains(elements.loadingIndicator)) {
    document.body.removeChild(elements.loadingIndicator);
  }
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", init);
export default init;