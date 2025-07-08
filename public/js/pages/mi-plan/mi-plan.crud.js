import {
  getMiPlanCollection,
  getPlanByUserId,
  savePlan,
} from "./mi-plan.firebase.js";
import { showError, showSuccess } from "./mi-plan.utils.js";
import { renderWeekGrid } from "./mi-plan.render.js";

let currentPlan = null;
let currentUserId = null;

// Función auxiliar para generar un ID de plan (si no tienes uno de Firebase Auth, por ejemplo)
function generatePlanId(userId) {
  return `${userId}-${Date.now()}`;
}

export async function loadUserPlan(userId) {
  try {
    currentUserId = userId;
    const plan = await getPlanByUserId(userId);

    if (plan) {
      currentPlan = plan;
    } else {
      // Crear un plan nuevo si no existe
      currentPlan = {
        id: generatePlanId(userId),
        userId: userId,
        nombre: `Plan de ${new Date().toLocaleDateString()}`,
        dias: [],
        createdAt: new Date().toISOString(),
      };
      await savePlan(currentPlan);
      showSuccess("¡Plan nuevo creado con éxito!");
    }

    return currentPlan;
  } catch (error) {
    console.error("Error cargando plan:", error);
    showError("Error al cargar tu plan");
    throw error;
  }
}

export async function assignItemToDay(dayId, slotType, item) {
  try {
    const dayIndex = currentPlan.dias.findIndex((d) => d.fecha === dayId);
    let dayPlan;

    if (dayIndex === -1) {
      dayPlan = {
        fecha: dayId,
        comidas: [],
        entrenamientos: [],
      };
      currentPlan.dias.push(dayPlan);
    } else {
      dayPlan = currentPlan.dias[dayIndex];
    }

    if (slotType === "entrenamiento") {
      dayPlan.entrenamientos = [item]; // Simplificado: solo permite un entrenamiento por slot
    } else {
      const comidaIndex = dayPlan.comidas.findIndex((c) => c.tipo === slotType);
      if (comidaIndex === -1) {
        dayPlan.comidas.push({
          tipo: slotType,
          receta: item,
        });
      } else {
        dayPlan.comidas[comidaIndex].receta = item;
      }
    }

    await savePlan(currentPlan);
    showSuccess("Elemento asignado al plan.");
    return currentPlan;
  } catch (error) {
    console.error("Error asignando elemento al día:", error);
    showError("Error al asignar elemento al plan.");
    throw error;
  }
}

export async function removeItemFromDay(dayId, slotType, itemId) {
  try {
    const day = currentPlan.dias.find((d) => d.fecha === dayId);
    if (!day) return;

    if (slotType === "entrenamiento") {
      day.entrenamientos = day.entrenamientos.filter(
        (item) => item.id !== itemId
      );
    } else {
      const comidaSlot = day.comidas.find((c) => c.tipo === slotType);
      if (comidaSlot && comidaSlot.receta && comidaSlot.receta.id === itemId) {
        comidaSlot.receta = null; // Eliminar la receta del slot
      }
    }

    // Limpiar días vacíos si es necesario (opcional)
    currentPlan.dias = currentPlan.dias.filter(
      (d) => d.comidas.some((c) => c.receta) || d.entrenamientos.length > 0
    );

    await savePlan(currentPlan);
    showSuccess("Elemento eliminado del plan.");
    return currentPlan;
  } catch (error) {
    console.error("Error eliminando elemento del día:", error);
    showError("Error al eliminar elemento del plan.");
    throw error;
  }
}

export function getCurrentPlan() {
  return currentPlan;
}

export function setCurrentPlan(plan) {
  currentPlan = plan;
}
