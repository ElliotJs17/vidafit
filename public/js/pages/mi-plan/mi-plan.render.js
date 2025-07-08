import { DIAS_SEMANA, TIPOS_COMIDA } from "./mi-plan.constants.js";
import elements from "./mi-plan.elements.js";
import { makeDraggable } from "./mi-plan.utils.js";

export function renderWeekGrid(plan, weekRange) {
  elements.semanaGrid.innerHTML = "";
  elements.currentWeek.textContent = weekRange.string;

  DIAS_SEMANA.forEach((dia) => {
    // Asegurarse de que el dayPlan siempre tenga una estructura para renderizar slots
    const dayPlan = plan?.dias?.find((d) => d.fecha === dia.id) || {
      fecha: dia.id,
      // Inicializar con slots de comida vacíos para cada tipo de comida
      comidas: TIPOS_COMIDA.map((tipo) => ({ tipo: tipo.id, receta: null })),
      entrenamientos: [],
    };

    // Asegurarse de que todos los TIPOS_COMIDA estén en dayPlan.comidas
    // para que siempre se rendericen todos los slots de comida, incluso si están vacíos
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
    dayElement.dataset.dia = dia.id; // Añadir data-dia al contenedor del día
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

// Renderiza el contenido dentro de un slot de comida
function renderComidaSlot(receta, slotType, dayId) {
  if (receta) {
    return `
      <div class="slot-content receta" draggable="true" data-id="${
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
  return "";
}

// Renderiza el contenido dentro de un slot de entrenamiento
function renderEntrenamientoSlot(entrenamiento, dayId) {
  if (entrenamiento) {
    return `
      <div class="slot-content entrenamiento" draggable="true" data-id="${entrenamiento.id}" data-type="entrenamiento" data-slot-type="entrenamiento" data-day-id="${dayId}">
        <div class="info">
          <span class="name">${entrenamiento.nombre}</span>
          <span class="details">⏱️ ${entrenamiento.duracion} min</span>
        </div>
        <button class="btn-remove">×</button>
      </div>
    `;
  }
  return "";
}

export function renderRecetasList(recetas) {
  elements.recetasList.innerHTML = recetas
    .map(
      (receta) => `
    <div class="receta-item" data-id="${receta.id}" draggable="true">
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

  // Hacer elementos arrastrables
  document.querySelectorAll(".receta-item").forEach((item) => {
    makeDraggable(item, {
      type: "receta",
      id: item.dataset.id,
      nombre: item.querySelector("h5").textContent,
      imagenUrl: item.querySelector("img")?.src,
      calorias: parseInt(
        item.querySelector(".receta-info span:nth-child(2)").textContent
      ),
      tiempoPreparacion: parseInt(
        item.querySelector(".receta-info span:nth-child(3)").textContent
      ),
      // Añadir otros datos de la receta si son necesarios para el drag-and-drop
      macronutrientes: {
        // Esto es un placeholder, deberías pasarlo desde el objeto receta real
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
    <div class="entrenamiento-item" data-id="${ent.id}" draggable="true">
      <div class="entrenamiento-info">
        <h5>${ent.nombre}</h5>
        <span>⏱️ ${ent.duracion} min</span>
      </div>
    </div>
  `
    )
    .join("");

  // Hacer elementos arrastrables
  document.querySelectorAll(".entrenamiento-item").forEach((item) => {
    makeDraggable(item, {
      type: "entrenamiento",
      id: item.dataset.id,
      nombre: item.querySelector("h5").textContent,
      duracion: parseInt(
        item.querySelector(".entrenamiento-info span").textContent
      ),
      // Añadir otros datos del entrenamiento si son necesarios
    });
  });
}
