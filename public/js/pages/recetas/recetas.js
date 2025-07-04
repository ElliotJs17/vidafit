// public/js/pages/recetas/recetas.js

import elements from "./recetas.elements.js";
import { initFirestore, getRecetasCollection } from "./recetas.firebase.js";
import { utils, showError, handleNetworkError } from "./recetas.utils.js";
import {
  openModal,
  closeModal,
  closeDetallesModal,
  handleImageUpload,
  removeImage,
  addIngredienteField,
  addPasoField,
} from "./recetas.form.js";
import { handleFormSubmit, setRecetaActualId } from "./recetas.crud.js";
import { renderRecetas } from "./recetas.render.js";
import {
  filtrarRecetas,
  debouncedFilter,
  limpiarFiltros,
  setTodasLasRecetas,
  getTodasLasRecetas,
  getRecetasFiltradas,
} from "./recetas.filters.js";
import { CACHE_DURATION } from "./recetas.constants.js";

let lastFetchTime = 0;

export async function loadRecetas() {
  try {
    utils.showLoading(elements);

    const firebaseInit = await initFirestore();
    if (!firebaseInit) {
      throw new Error("No se pudo conectar con Firebase");
    }

    const { getDocs } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );
    const recetasCollection = getRecetasCollection();

    // Añadir timeout para evitar carga infinita
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Tiempo de espera agotado al cargar recetas"));
      }, 10000); // 10 segundos de timeout
    });

    const querySnapshot = await Promise.race([
      getDocs(recetasCollection),
      timeoutPromise,
    ]);

    const fetchedRecetas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Ordenar por fecha de creación (más recientes primero)
    fetchedRecetas.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    setTodasLasRecetas(fetchedRecetas);
    lastFetchTime = Date.now();
    filtrarRecetas(); // Aplica filtros iniciales y renderiza
  } catch (error) {
    console.error("Error cargando recetas:", error);
    if (getTodasLasRecetas().length === 0) {
      utils.showEmpty(elements);
    } else {
      utils.showResults(elements, getRecetasFiltradas().length);
    }
    handleNetworkError(error);
  } finally {
    utils.hideLoading(elements);
  }
}

// Manejadores de eventos optimizados
function handleModalClose(event) {
  if (event.key === "Escape") {
    closeModal();
    closeDetallesModal();
  }
}

function handleModalOverlayClick(event) {
  if (event.target.classList.contains("modal-overlay")) {
    if (event.target.id === "modal-receta") {
      closeModal();
    } else if (event.target.id === "modal-detalles") {
      closeDetallesModal();
    }
  }
}

// Configuración inicial de eventos
function setupEventListeners() {
  // Solo adjuntar listeners si los elementos existen y no se han adjuntado ya
  if (!elements.openModalBtn || !elements.formReceta) return;
  if (elements.formReceta.dataset.listenersAttached) return; // Previene doble adjunción
  elements.formReceta.dataset.listenersAttached = "true";

  // Modal
  elements.openModalBtn.addEventListener("click", openModal);
  if (elements.btnCrearVacio) {
    elements.btnCrearVacio.addEventListener("click", openModal);
  }
  if (elements.closeModalBtn) {
    elements.closeModalBtn.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", handleModalClose);
  // Delegación de click en el document para overlay
  document.addEventListener("click", handleModalOverlayClick);

  // Formulario
  elements.formReceta.addEventListener("submit", handleFormSubmit);
  const addIngredienteBtn = document.getElementById("agregar-ingrediente");
  if (addIngredienteBtn) {
    addIngredienteBtn.addEventListener("click", () => addIngredienteField());
  }
  const addPasoBtn = document.getElementById("agregar-paso");
  if (addPasoBtn) {
    addPasoBtn.addEventListener("click", () => addPasoField());
  }

  // Manejo de imágenes
  if (elements.recetaImagenInput) {
    elements.recetaImagenInput.addEventListener("change", handleImageUpload);
  }
  if (elements.eliminarImagenBtn) {
    elements.eliminarImagenBtn.addEventListener("click", removeImage);
  }

  // Búsqueda y filtros
  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", debouncedFilter);
  }
  if (elements.searchBtn) {
    elements.searchBtn.addEventListener("click", filtrarRecetas);
  }
  if (elements.filtroCategoria) {
    elements.filtroCategoria.addEventListener("change", filtrarRecetas);
  }
  if (elements.filtroDificultad) {
    elements.filtroDificultad.addEventListener("change", filtrarRecetas);
  }
  if (elements.filtroTiempo) {
    elements.filtroTiempo.addEventListener("change", filtrarRecetas);
  }
  if (elements.filtroCalorias) {
    elements.filtroCalorias.addEventListener("change", filtrarRecetas);
  }
  if (elements.limpiarFiltros) {
    elements.limpiarFiltros.addEventListener("click", limpiarFiltros);
  }
}

// Inicialización de la aplicación
async function initApp() {
  try {
    utils.showLoading(elements);
    setupEventListeners();
    await loadRecetas();
  } catch (error) {
    console.error("Error inicializando la aplicación:", error);
    showError("Error al iniciar la aplicación");
    utils.showEmpty(elements);
  } finally {
    utils.hideLoading(elements);
  }
}

// Export para SPA (ej. main-app.js lo importaría)
export default function initRecetas() {
  initApp();
}

// Global functions para onclick/inline events (considerar refactorizar si es posible)
// Es preferible evitar esto en general y usar addEventListener
// pero si tu HTML lo requiere, se mantienen por compatibilidad.
window.editarReceta = (id) =>
  import("./recetas.crud.js").then((module) => module.editarReceta(id));
window.eliminarReceta = (id) =>
  import("./recetas.crud.js").then((module) => module.eliminarReceta(id));
window.closeModal = closeModal; // Esto puede seguir siendo global
window.closeDetallesModal = closeDetallesModal; // Esto puede seguir siendo global

// Iniciar si es el punto de entrada (por ejemplo, al cargar la página directamente)
// Esto es útil para desarrollo o si la página se carga sin un router SPA.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith("recetas.html")) {
      // O la URL de tu página de recetas
      initApp();
    }
  });
} else {
  if (window.location.pathname.endsWith("recetas.html")) {
    initApp();
  }
}
