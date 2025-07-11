import { TIPOS_COMIDA } from "./mi-plan.constants.js";
import elements from "./mi-plan.elements.js";
import { makeDraggable } from "./mi-plan.utils.js";

export function renderWeekGrid(plan, weekRange) {
  if (!elements.semanaGrid) return;
  //elements.semanaGrid.innerHTML = "";
  //elements.currentWeek.textContent = weekRange.string;

    // elements.semanaGrid.innerHTML = "";
    if (!elements.semanaGrid) return;
    elements.semanaGrid.innerHTML = "";

    if (elements.semanaGrid) {
    elements.semanaGrid.appendChild(dayElement);
    }

    plan.dias.forEach((diaObj, index) => {
  const fecha = diaObj.fecha; // p. ej., "2025-07-07"
  const nombreDia = DIAS_SEMANA[index]?.nombre || fecha; // Lunes, Martes, etc.

  const comidasParaRender = TIPOS_COMIDA.map((tipo) => {
    return (
      diaObj.comidas.find((c) => c.tipo === tipo.id) || {
        tipo: tipo.id,
        receta: null,
      }
    );
  });

  const dayElement = document.createElement("div");
  dayElement.className = "dia-card";
  dayElement.dataset.dia = fecha;
  dayElement.innerHTML = `
    <h4>${nombreDia}</h4>
    <div class="comidas-slots">
      ${comidasParaRender
        .map(
          (comidaSlot) => `
        <div class="slot comida-slot" data-tipo="${comidaSlot.tipo}" data-dia="${fecha}">
          <span>${
            TIPOS_COMIDA.find((t) => t.id === comidaSlot.tipo)?.nombre || comidaSlot.tipo
          }</span>
          ${renderComidaSlot(comidaSlot.receta, comidaSlot.tipo, fecha)}
        </div>
      `
        )
        .join("")}
    </div>
    <div class="entrenamiento-slot-container">
      <div class="slot entrenamiento-slot" data-tipo="entrenamiento" data-dia="${fecha}">
        <span>Entrenamiento</span>
        ${renderEntrenamientoSlot(diaObj.entrenamientos[0], fecha)}
      </div>
    </div>
  `;
  elements.semanaGrid.appendChild(dayElement);
});

  
}

function renderComidaSlot(receta, slotType, dayId) {
  if (!receta) return "";

  return `
    <div class="slot-content receta" data-id="${
      receta.id
    }" data-type="receta" data-slot-type="${slotType}" data-day-id="${dayId}">
      <img src="${receta.imagenUrl || "placeholder.jpg"}" alt="${
    receta.nombre
  }">
      <div class="info">
        <span class="name">${receta.nombre}</span>
        <span class="details">${receta.calorias} cal</span>
      </div>
      <button class="btn-remove">×</button>
    </div>
  `;
}

function renderEntrenamientoSlot(entrenamiento, dayId) {
  if (!entrenamiento) return "";

  return `
    <div class="slot-content entrenamiento" data-id="${entrenamiento.id}" data-type="entrenamiento" data-slot-type="entrenamiento" data-day-id="${dayId}">
      <div class="info">
        <span class="name">${entrenamiento.nombre}</span>
        <span class="details">⏱️ ${entrenamiento.duracion} min</span>
      </div>
      <button class="btn-remove">×</button>
    </div>
  `;
}

export function renderRecetasList(recetas) {
  elements.recetasList.innerHTML = recetas
    .map(
      (receta) => `
        <div class="item-card receta-item" data-id="${receta.id}" data-type="receta">
          <input type="checkbox" class="item-checkbox" />
          <img src="${receta.imagenUrl || "placeholder.jpg"}" alt="${receta.nombre}">
          <div class="receta-info">
            <span class="name">${receta.nombre}</span>
            <span>${receta.calorias} cal | ${receta.tiempoPreparacion} min</span>
          </div>
        </div>
      `
    )
    .join("");

  // Si quieres que aún sea draggable
  document.querySelectorAll(".receta-item").forEach((item) => {
    const receta = recetas.find((r) => r.id === item.dataset.id);
    makeDraggable(item, {
      type: "receta",
      id: receta.id,
      nombre: receta.nombre,
      imagenUrl: receta.imagenUrl,
      calorias: receta.calorias,
      tiempoPreparacion: receta.tiempoPreparacion,
      macronutrientes: receta.macronutrientes || {
        proteinas: 0,
        carbohidratos: 0,
        grasas: 0,
      },
    });
  });
}


export function renderEntrenamientosList(entrenamientos) {
 elements.entrenamientosList.innerHTML = entrenamientos
  .map(
    (ent) => `
      <div class="item-card entrenamiento-item" data-id="${ent.id}" data-type="entrenamiento">
        <input type="checkbox" class="item-checkbox" />
        <div class="entrenamiento-info">
          <span class="name">${ent.nombre}</span>
          <span>⏱️ ${ent.duracion} min | 🔥 ${ent.calorias || 0} cal</span>
          <span>🏋️ Tipo: ${ent.tipo || "N/A"}</span>
          <span>🎯 Objetivo: ${ent.objetivo || "N/A"}</span>
          <span>💪 Nivel: ${ent.nivel || "N/A"}</span>
        </div>
      </div>
    `
  )
  .join("");


  document.querySelectorAll(".entrenamiento-item").forEach((item) => {
    const ent = entrenamientos.find((e) => e.id === item.dataset.id);
    makeDraggable(item, {
      type: "entrenamiento",
      id: ent.id,
      nombre: ent.nombre,
      duracion: ent.duracion,
      calorias: ent.calorias || 0,
      tipo: ent.tipo || "general",
    });
  });
}

