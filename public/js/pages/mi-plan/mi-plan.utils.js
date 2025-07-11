import { DIAS_SEMANA, TIPOS_COMIDA } from "./mi-plan.constants.js";

export function formatDate(date) {
  return new Date(date).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getWeekRange(date = new Date()) {
  const now = new Date(date);
  const dayOfWeek = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday,
    end: sunday,
    string: `Del ${formatDate(monday)} al ${formatDate(sunday)}`,
    id: monday.toISOString().split("T")[0],
  };
}

export function calculateNutritionTotals(plan) {
  const totals = {
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
    caloriasQuemadas: 0,
  };

  if (!plan?.dias) return totals;

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

    dia.entrenamientos.forEach((ent) => {
      totals.caloriasQuemadas += ent.calorias || 0;
    });
  });

  return totals;
}

export function showError(message) {
  const toast = document.createElement("div");
  toast.className = "toast error";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

export function showSuccess(message) {
  const toast = document.createElement("div");
  toast.className = "toast success";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

export function makeDraggable(element, data) {
  element.setAttribute("draggable", "true");
  element.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("application/json", JSON.stringify(data));
    e.dataTransfer.effectAllowed = "move";
    element.classList.add("dragging");
  });

  element.addEventListener("dragend", () => {
    element.classList.remove("dragging");
  });
}
