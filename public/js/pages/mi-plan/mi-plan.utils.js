import { DIAS_SEMANA, TIPOS_COMIDA } from "./mi-plan.constants.js";

export function formatDate(date) {
  return new Date(date).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getCurrentWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // Ajuste para que lunes sea 1
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday,
    end: sunday,
    string: `Del ${formatDate(monday)} al ${formatDate(sunday)}`,
  };
}

export function calculateNutritionTotals(plan) {
  const totals = {
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
  };

  if (!plan || !plan.dias) return totals;

  plan.dias.forEach((dia) => {
    dia.comidas.forEach((comida) => {
      if (comida.receta) {
        totals.calorias += comida.receta.calorias || 0;
        totals.proteinas += comida.receta.macronutrientes?.proteinas || 0;
        totals.carbohidratos +=
          comida.receta.macronutrientes?.carbohidratos || 0;
        totals.grasas += comida.receta.macronutrientes?.grasas || 0;
      }
    });
  });
  return totals;
}

/**
 * Muestra un mensaje de error al usuario.
 * @param {string} message El mensaje de error a mostrar.
 */
export function showError(message) {
  console.error("Error:", message);
  alert(`Error: ${message}`);
}

/**
 * Muestra un mensaje de éxito al usuario.
 * @param {string} message El mensaje de éxito a mostrar.
 */
export function showSuccess(message) {
  console.log("Éxito:", message);
}

/**
 * Hace que un elemento sea arrastrable y almacena datos en el evento de arrastre.
 * @param {HTMLElement} element El elemento DOM que se hará arrastrable.
 * @param {Object} data Los datos que se adjuntarán al evento de arrastre (ej. { id: 'receta1', type: 'receta' }).
 */
export function makeDraggable(element, data) {
  element.setAttribute("draggable", "true");
  element.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "move"; // O "copy"
  });
}
