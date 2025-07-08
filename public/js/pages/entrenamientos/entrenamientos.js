// public/js/pages/entrenamientos/entrenamientos.js

import elements from "./entrenamientos.elements.js";
import {
  initFirestore,
  getEntrenamientosCollection,
} from "./entrenamientos.firebase.js";
import {
  utils,
  showError,
  handleNetworkError,
} from "./entrenamientos.utils.js";
import {
  openModal,
  closeModal,
  closeDetallesModal,
  handleImageUpload,
  removeImage,
  addEjercicioField,
  addInstruccionField,
} from "./entrenamientos.form.js";
import {
  handleFormSubmit,
  setEntrenamientoActualId,
} from "./entrenamientos.crud.js";
import { renderEntrenamientos } from "./entrenamientos.render.js";
import {
  filtrarEntrenamientos,
  debouncedFilter,
  limpiarFiltros,
  setTodosLosEntrenamientos,
  getTodosLosEntrenamientos,
  getEntrenamientosFiltrados,
} from "./entrenamientos.filters.js";
import { CACHE_DURATION } from "./entrenamientos.constants.js";

let lastFetchTime = 0;
let isInitialized = false;
let eventListenersAttached = false;
let entrenamientosCollection = null;
let db = null;

export async function loadEntrenamientos() {
  try {
    console.log("Iniciando carga de entrenamientos...");
    utils.showLoading(elements);

    const firebaseInit = await initFirestore();
    if (!firebaseInit) {
      throw new Error("No se pudo conectar con Firebase");
    }

    const { getDocs } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );
    entrenamientosCollection = getEntrenamientosCollection();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Tiempo de espera agotado al cargar entrenamientos"));
      }, 10000);
    });

    const querySnapshot = await Promise.race([
      getDocs(entrenamientosCollection),
      timeoutPromise,
    ]);

    const fetchedEntrenamientos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    fetchedEntrenamientos.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    console.log(`Cargados ${fetchedEntrenamientos.length} entrenamientos`);
    setTodosLosEntrenamientos(fetchedEntrenamientos);
    lastFetchTime = Date.now();
    filtrarEntrenamientos();
  } catch (error) {
    console.error("Error cargando entrenamientos:", error);
    if (getTodosLosEntrenamientos().length === 0) {
      utils.showEmpty(elements);
    } else {
      utils.showResults(elements, getEntrenamientosFiltrados().length);
    }
    handleNetworkError(error);
  } finally {
    utils.hideLoading(elements);
  }
}

function handleModalClose(event) {
  if (event.key === "Escape") {
    closeModal();
    closeDetallesModal();
  }
}

function handleModalOverlayClick(event) {
  if (event.target.classList.contains("modal-overlay")) {
    if (event.target.id === "modal-entrenamiento") {
      closeModal();
    } else if (event.target.id === "modal-detalles") {
      closeDetallesModal();
    }
  }
}

function removeAllEventListeners() {
  // Remover listeners de documento
  document.removeEventListener("keydown", handleModalClose);
  document.removeEventListener("click", handleModalOverlayClick);

  // Marcar como no inicializado
  eventListenersAttached = false;
}

function setupEventListeners() {
  // Verificar si ya están los listeners y si los elementos existen
  if (eventListenersAttached || !elements.formEntrenamiento) {
    console.log("Event listeners ya configurados o elementos no disponibles");
    return;
  }

  console.log("Configurando event listeners...");

  // Remover listeners existentes primero
  removeAllEventListeners();

  // Listeners de botones principales
  if (elements.openModalBtn) {
    elements.openModalBtn.addEventListener("click", openModal);
  }

  if (elements.btnCrearVacio) {
    elements.btnCrearVacio.addEventListener("click", openModal);
  }

  if (elements.closeModalBtn) {
    elements.closeModalBtn.addEventListener("click", closeModal);
  }

  // Listeners de documento
  document.addEventListener("keydown", handleModalClose);
  document.addEventListener("click", handleModalOverlayClick);

  // Listener del formulario
  if (elements.formEntrenamiento) {
    elements.formEntrenamiento.addEventListener("submit", handleFormSubmit);
  }

  // Botones de agregar
  const addEjercicioBtn = document.getElementById("agregar-ejercicio");
  if (addEjercicioBtn) {
    addEjercicioBtn.addEventListener("click", () => addEjercicioField());
  }

  const addInstruccionBtn = document.getElementById("agregar-instruccion");
  if (addInstruccionBtn) {
    addInstruccionBtn.addEventListener("click", () => addInstruccionField());
  }

  // Listeners de imagen
  if (elements.entrenamientoImagenInput) {
    elements.entrenamientoImagenInput.addEventListener(
      "change",
      handleImageUpload
    );
  }

  if (elements.eliminarImagenBtn) {
    elements.eliminarImagenBtn.addEventListener("click", removeImage);
  }

  // Listeners de filtros
  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", debouncedFilter);
  }

  if (elements.searchBtn) {
    elements.searchBtn.addEventListener("click", filtrarEntrenamientos);
  }

  if (elements.filtroTipo) {
    elements.filtroTipo.addEventListener("change", filtrarEntrenamientos);
  }

  if (elements.filtroNivel) {
    elements.filtroNivel.addEventListener("change", filtrarEntrenamientos);
  }

  if (elements.filtroDuracion) {
    elements.filtroDuracion.addEventListener("change", filtrarEntrenamientos);
  }

  if (elements.filtroEquipamiento) {
    elements.filtroEquipamiento.addEventListener(
      "change",
      filtrarEntrenamientos
    );
  }

  if (elements.limpiarFiltros) {
    elements.limpiarFiltros.addEventListener("click", limpiarFiltros);
  }

  eventListenersAttached = true;
  console.log("Event listeners configurados correctamente");
}

async function initApp() {
  // Resetear el estado de Firebase al reiniciar
  db = null;
  entrenamientosCollection = null;

  try {
    console.log("Inicializando aplicación de entrenamientos...");
    utils.showLoading(elements);

    // Forzar reinicialización de Firebase
    const firebaseInit = await initFirestore();
    if (!firebaseInit) {
      throw new Error("No se pudo conectar con Firebase");
    }

    setupEventListeners();
    await loadEntrenamientos();
    isInitialized = true;
    console.log("Aplicación inicializada correctamente");
  } catch (error) {
    console.error("Error inicializando la aplicación:", error);
    showError("Error al iniciar la aplicación");
    utils.showEmpty(elements);
    // Resetear el estado para permitir reintentos
    isInitialized = false;
    eventListenersAttached = false;
  } finally {
    utils.hideLoading(elements);
  }
}

// Función para reinicializar cuando se navega de vuelta
export function reinitialize() {
  console.log("Reinicializando entrenamientos...");
  isInitialized = false;
  eventListenersAttached = false;
  // Limpiar completamente el estado de Firebase
  db = null;
  entrenamientosCollection = null;
  initApp();
}

// Función para limpiar cuando se sale de la página
export function cleanup() {
  console.log("Limpiando entrenamientos...");
  removeAllEventListeners();
  isInitialized = false;
  eventListenersAttached = false;
}

export default function initEntrenamientos() {
  initApp();
}

// Funciones globales
window.editarEntrenamiento = (id) =>
  import("./entrenamientos.crud.js").then((module) =>
    module.editarEntrenamiento(id)
  );
window.eliminarEntrenamiento = (id) =>
  import("./entrenamientos.crud.js").then((module) =>
    module.eliminarEntrenamiento(id)
  );
window.closeModal = closeModal;
window.closeDetallesModal = closeDetallesModal;

// Función para verificar si estamos en la página correcta
function isEntrenamientosPage() {
  return (
    window.location.pathname.includes("entrenamientos") ||
    window.location.pathname.endsWith("entrenamientos.html") ||
    document.querySelector("#entrenamientos-grid") !== null
  );
}

// Inicialización automática
function autoInit() {
  if (isEntrenamientosPage()) {
    console.log("Página de entrenamientos detectada, inicializando...");
    initApp();
  }
}

// Manejar diferentes estados de carga del documento
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit);
} else {
  // Si el documento ya está cargado, usar setTimeout para asegurar que el DOM esté listo
  setTimeout(autoInit, 0);
}

// Opcional: Listener para detectar cambios de página (si usas un router SPA)
window.addEventListener("popstate", () => {
  if (isEntrenamientosPage()) {
    console.log("Navegación detectada, reinicializando...");
    reinitialize();
  }
});
