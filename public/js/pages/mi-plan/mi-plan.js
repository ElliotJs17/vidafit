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
import { initCalendar, crearEventosDesdePlan 
  } from "./calendar-init.js";

// Estado global
let currentWeek = getWeekRange();
let currentUserId = null;

// Inicialización
async function init() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = "/index.html";
      return;
    }
    currentUserId = user.uid;

    const firestoreInitialized = await initFirestore();
    if (!firestoreInitialized) {
      showError("No se pudo conectar con la base de datos");
      return;
    }

    await loadInitialData();
    
    // Renderizar la semana actual
    setupEventListeners();
    // ❌ ya no llames initCalendar() aquí
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
    const recetas = await loadRecetas();
    const entrenamientos = await loadEntrenamientos();

    // Agrega recetas y entrenamientos al plan
    plan.allRecetas = recetas;
    plan.allEntrenamientos = entrenamientos;

    setCurrentPlan(plan);

    renderWeekGrid(plan, currentWeek);
    updateNutritionTotals(plan);
    renderRecetasList(recetas);
    renderEntrenamientosList(entrenamientos);

    const eventos = crearEventosDesdePlan(plan); // ✅ Generar eventos
    initCalendar(eventos); // ✅ Renderizar calendario con eventos

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

// Asignar receta automáticamente a la siguiente fecha disponible
async function asignarRecetaEnFechaDisponible(tipoComida, receta) {
  const plan = getCurrentPlan();
  let fechaActual = new Date(); // hoy
  let maxDias = 14;
  let fechaISO = fechaActual.toISOString().split("T")[0];

  while (maxDias-- > 0) {
    const dia = plan.dias.find((d) => d.fecha === fechaISO);
    const yaOcupado = dia?.comidas?.some((c) => c.tipo === tipoComida && c.receta);

    if (!yaOcupado) {
      await assignItemToDay(fechaISO, tipoComida, receta);
      return;
    }

    // siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
    fechaISO = fechaActual.toISOString().split("T")[0];
  }

  showError("No se encontró una fecha libre para esta receta.");
}

// Asignar entrenamiento automáticamente a la siguiente fecha disponible
async function asignarEntrenamientoEnFechaDisponible(entrenamiento) {
  const plan = getCurrentPlan();
  let fechaActual = new Date(); // hoy
  let maxDias = 14;
  let fechaISO = fechaActual.toISOString().split("T")[0];

  while (maxDias-- > 0) {
    const dia = plan.dias.find((d) => d.fecha === fechaISO);
    const yaOcupado = dia?.entrenamientos?.length > 0;

    if (!yaOcupado) {
      await assignItemToDay(fechaISO, "entrenamiento", entrenamiento);
      return;
    }

    fechaActual.setDate(fechaActual.getDate() + 1);
    fechaISO = fechaActual.toISOString().split("T")[0];
  }

  showError("No se encontró una fecha libre para este entrenamiento.");
}

function setupEventListeners() {
  const lunesISO = currentWeek.start.toISOString().split("T")[0]; // ✅ Fecha real de lunes

  // Botón: Agregar recetas
  elements.btnAgregarRecetas.addEventListener("click", async () => {
    const selected = [...elements.recetasList.querySelectorAll(".item-card input:checked")]
      .map((checkbox) => checkbox.closest(".item-card"));

    const plan = getCurrentPlan();

    for (const item of selected) {
      const recetaId = item.dataset.id;
      const receta = plan.allRecetas.find((r) => r.id === recetaId);
      if (receta) {
        await asignarRecetaEnFechaDisponible("desayuno", receta);
 // ✅ Usa fecha válida
      }
    }

    await loadInitialData();
    showSuccess("Recetas agregadas al plan.");
  });

  // Botón: Agregar entrenamientos
  elements.btnAgregarEntrenamientos.addEventListener("click", async () => {
    const selected = [...elements.entrenamientosList.querySelectorAll(".item-card input:checked")]
      .map((checkbox) => checkbox.closest(".item-card"));

    const plan = getCurrentPlan();

    for (const item of selected) {
      const entrenamientoId = item.dataset.id;
      const entrenamiento = plan.allEntrenamientos.find((e) => e.id === entrenamientoId);
      if (entrenamiento) {
        await asignarEntrenamientoEnFechaDisponible(entrenamiento);
 // ✅ Usa fecha válida
      }
    }

    await loadInitialData();
    showSuccess("Entrenamientos agregados al plan.");
  });

  // Tabs del sidebar
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

  // Búsqueda de recetas
  elements.buscarRecetas.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const allRecetas = getCurrentPlan().allRecetas || [];
    const filteredRecetas = allRecetas.filter(
      (receta) =>
        receta.nombre.toLowerCase().includes(searchTerm) ||
        receta.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
    renderRecetasList(filteredRecetas);
  });

  // Búsqueda de entrenamientos
  elements.buscarEntrenamientos.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const allEntrenamientos = getCurrentPlan().allEntrenamientos || [];
    const filteredEntrenamientos = allEntrenamientos.filter(
      (ent) =>
        ent.nombre.toLowerCase().includes(searchTerm) ||
        ent.keywords?.some((kw) => kw.toLowerCase().includes(searchTerm))
    );
    renderEntrenamientosList(filteredEntrenamientos);
  });

  elements.btnEstadisticas.addEventListener("click", () => {
  const hoy = new Date().toISOString().split("T")[0];
  const plan = getCurrentPlan();
  const diaHoy = plan.dias.find((d) => d.fecha === hoy);

  if (!diaHoy) {
    showError("No hay plan para hoy.");
    return;
  }

  const recetas = diaHoy.comidas || [];
  const entrenamientos = diaHoy.entrenamientos || [];

  let html = "";

  if (recetas.length > 0) {
    html += "<h4>Comidas</h4><ul>";
    recetas.forEach((c) => {
      html += `<li><strong>${c.tipo}</strong>: ${c.receta?.nombre || "Sin receta"}</li>`;
    });
    html += "</ul>";
  } else {
    html += "<p>No hay comidas asignadas.</p>";
  }

  if (entrenamientos.length > 0) {
    html += "<h4>Entrenamientos</h4><ul>";
    entrenamientos.forEach((e) => {
      html += `<li>
        <strong>${e.nombre}</strong><br>
        ⏱️ <strong>Duración:</strong> ${e.duracion || "N/A"} min |
        🔥 <strong>Calorías:</strong> ${e.calorias || 0} cal<br>
        🏋️ <strong>Tipo:</strong> ${e.tipo || "N/A"} |
        🎯 <strong>Objetivo:</strong> ${e.objetivo || "N/A"} |
        💪 <strong>Nivel:</strong> ${e.nivel || "N/A"}
      </li>`;
    });
    html += "</ul>";
  }

  const contenedor = document.getElementById("contenido-rutina-hoy");
  contenedor.innerHTML = html;

  // ✅ Mostrar el modal centrado
  const modal = document.getElementById("modal-rutina");
  modal.style.display = "block";
});

// ✅ Cierre del modal (fuera del botón)
document.getElementById("cerrar-modal-rutina").addEventListener("click", () => {
  document.getElementById("modal-rutina").style.display = "none";
});

window.addEventListener("click", (event) => {
  const modal = document.getElementById("modal-rutina");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});


  /*
  // Modal estadísticas
  elements.btnEstadisticas.addEventListener("click", () => {
    elements.modalEstadisticas.style.display = "block";
    renderStats();
  });

  elements.closeEstadisticas.addEventListener("click", () => {
    elements.modalEstadisticas.style.display = "none";
  });

  // Modal detalles
  elements.closeDetalles.addEventListener("click", () => {
    elements.modalDetalles.style.display = "none";
  });*/
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