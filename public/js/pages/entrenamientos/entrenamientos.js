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

export async function loadEntrenamientos() {
  try {
    utils.showLoading(elements);

    const firebaseInit = await initFirestore();
    if (!firebaseInit) {
      throw new Error("No se pudo conectar con Firebase");
    }

    const { getDocs } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );
    const entrenamientosCollection = getEntrenamientosCollection();

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

function setupEventListeners() {
  if (!elements.openModalBtn || !elements.formEntrenamiento) return;
  if (elements.formEntrenamiento.dataset.listenersAttached) return;
  elements.formEntrenamiento.dataset.listenersAttached = "true";

  elements.openModalBtn.addEventListener("click", openModal);
  if (elements.btnCrearVacio) {
    elements.btnCrearVacio.addEventListener("click", openModal);
  }
  if (elements.closeModalBtn) {
    elements.closeModalBtn.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", handleModalClose);
  document.addEventListener("click", handleModalOverlayClick);

  elements.formEntrenamiento.addEventListener("submit", handleFormSubmit);
  const addEjercicioBtn = document.getElementById("agregar-ejercicio");
  if (addEjercicioBtn) {
    addEjercicioBtn.addEventListener("click", () => addEjercicioField());
  }
  const addInstruccionBtn = document.getElementById("agregar-instruccion");
  if (addInstruccionBtn) {
    addInstruccionBtn.addEventListener("click", () => addInstruccionField());
  }

  if (elements.entrenamientoImagenInput) {
    elements.entrenamientoImagenInput.addEventListener(
      "change",
      handleImageUpload
    );
  }
  if (elements.eliminarImagenBtn) {
    elements.eliminarImagenBtn.addEventListener("click", removeImage);
  }

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
}

async function initApp() {
  try {
    utils.showLoading(elements);
    setupEventListeners();
    await loadEntrenamientos();
  } catch (error) {
    console.error("Error inicializando la aplicación:", error);
    showError("Error al iniciar la aplicación");
    utils.showEmpty(elements);
  } finally {
    utils.hideLoading(elements);
  }
}

export default function initEntrenamientos() {
  initApp();
}

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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith("entrenamientos.html")) {
      initApp();
    }
  });
} else {
  if (window.location.pathname.endsWith("entrenamientos.html")) {
    initApp();
  }
}
