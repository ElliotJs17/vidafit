import {
  getMiPlanCollection,
  getPlanByWeekId,
  savePlan,
} from "./mi-plan.firebase.js";
import { showError, showSuccess } from "./mi-plan.utils.js";
import { DIAS_SEMANA, TIPOS_COMIDA } from "./mi-plan.constants.js"; // Importar DIAS_SEMANA y TIPOS_COMIDA

let currentPlan = null;
// let currentUserId = null; // Esta variable global no es necesaria aquí

export async function loadUserPlan(userId, weekId) {
  try {
    const planId = `${userId}-${weekId}`;
    const plan = await getPlanByWeekId(planId);

    if (plan) {
      currentPlan = plan;
    } else {
      currentPlan = {
        id: planId,
        userId: userId,
        weekId: weekId,
        nombre: `Plan Semanal ${new Date(weekId).toLocaleDateString()}`,
        dias: DIAS_SEMANA.map((dia) => ({
          fecha: dia.id,
          comidas: TIPOS_COMIDA.map((tipo) => ({
            tipo: tipo.id,
            receta: null,
          })),
          entrenamientos: [],
        })),
        createdAt: new Date().toISOString(),
      };
      await savePlan(currentPlan);
      showSuccess("¡Nuevo plan creado!");
    }

    return currentPlan;
  } catch (error) {
    console.error("Error cargando plan:", error);
    showError("Error al cargar tu plan");
    throw error;
  }
}

export function getCurrentPlan() {
  return currentPlan;
}

export function setCurrentPlan(plan) {
  currentPlan = plan;
}

export async function assignItemToDay(dayId, slotType, item) {
  try {
    const dayIndex = currentPlan.dias.findIndex((d) => d.fecha === dayId);
    let dayPlan;

    if (dayIndex === -1) {
      dayPlan = {
        fecha: dayId,
        comidas: TIPOS_COMIDA.map((tipo) => ({ tipo: tipo.id, receta: null })), // Asegura que se inicializan todos los tipos de comida
        entrenamientos: [],
      };
      currentPlan.dias.push(dayPlan);
    } else {
      dayPlan = currentPlan.dias[dayIndex];
    }

    if (slotType === "entrenamiento") {
      // Si ya hay un entrenamiento, lo reemplaza. Podrías querer permitir múltiples.
      dayPlan.entrenamientos = [item];
    } else {
      const comidaIndex = dayPlan.comidas.findIndex((c) => c.tipo === slotType);
      if (comidaIndex === -1) {
        // Esto no debería ocurrir si inicializamos comidas con todos los tipos
        dayPlan.comidas.push({
          tipo: slotType,
          receta: item,
        });
      } else {
        dayPlan.comidas[comidaIndex].receta = item;
      }
    }

    await savePlan(currentPlan);
    return currentPlan;
  } catch (error) {
    console.error("Error asignando elemento:", error);
    throw error;
  }
}

export async function removeItemFromDay(dayId, slotType, itemId) {
  try {
    const day = currentPlan.dias.find((d) => d.fecha === dayId);
    if (!day) return currentPlan;

    if (slotType === "entrenamiento") {
      day.entrenamientos = day.entrenamientos.filter(
        (item) => item.id !== itemId
      );
    } else {
      const comidaSlot = day.comidas.find((c) => c.tipo === slotType);
      if (comidaSlot && comidaSlot.receta && comidaSlot.receta.id === itemId) {
        comidaSlot.receta = null; // Quita la receta asignada
      }
    }

    await savePlan(currentPlan);
    return currentPlan;
  } catch (error) {
    console.error("Error eliminando elemento:", error);
    throw error;
  }
}
