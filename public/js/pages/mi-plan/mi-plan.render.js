import { DIAS_SEMANA, TIPOS_COMIDA } from "./mi-plan.constants.js";
import elements from "./mi-plan.elements.js";
import { makeDraggable } from "./mi-plan.utils.js";

export function renderWeekGrid(plan, weekRange) {
  elements.semanaGrid.innerHTML = "";
  elements.currentWeek.textContent = weekRange.string;

  DIAS_SEMANA.forEach((dia) => {
    const dayPlan = plan?.dias?.find((d) => d.fecha === dia.id) || {
      fecha: dia.id,
      comidas: TIPOS_COMIDA.map((tipo) => ({ tipo: tipo.id, receta: null })),
      entrenamientos: [],
    };

    const comidasParaRender = TIPOS_COMIDA.map((tipo) => {
      return (
        dayPlan.comidas.find((c) => c.tipo === tipo.id) || {
          tipo: tipo.id,
          receta: null,
        }
      );
    });

    const dayElement = document.createElement("div");
    dayElement.className = "dia-card";
    dayElement.dataset.dia = dia.id;
    dayElement.innerHTML = `
      <h4>${dia.nombre}</h4>
      <div class="comidas-slots">
        ${comidasParaRender
          .map(
            (comidaSlot) => `
          <div class="slot comida-slot" data-tipo="${
            comidaSlot.tipo
          }" data-dia="${dia.id}">
            <span>${
              TIPOS_COMIDA.find((t) => t.id === comidaSlot.tipo)?.nombre ||
              comidaSlot.tipo
            }</span>
            ${renderComidaSlot(comidaSlot.receta, comidaSlot.tipo, dia.id)}
          </div>
        `
          )
          .join("")}
      </div>
      <div class="entrenamiento-slot-container">
        <div class="slot entrenamiento-slot" data-tipo="entrenamiento" data-dia="${
          dia.id
        }">
          <span>Entrenamiento</span>
          ${renderEntrenamientoSlot(dayPlan.entrenamientos[0], dia.id)}
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
    <div class="receta-item" data-id="${receta.id}">
      <img src="${receta.imagenUrl || "placeholder.jpg"}" alt="${
        receta.nombre
      }">
      <div class="receta-info">
        <h5>${receta.nombre}</h5>
        <span>${receta.calorias} cal</span>
        <span>${receta.tiempoPreparacion} min</span>
      </div>
    </div>
  `
    )
    .join("");

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
    <div class="entrenamiento-item" data-id="${ent.id}">
      <div class="entrenamiento-info">
        <h5>${ent.nombre}</h5>
        <span>⏱️ ${ent.duracion} min</span>
        <span>🔥 ${ent.calorias || 0} cal</span>
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
