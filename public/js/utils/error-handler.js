/**
 * Módulo para manejo centralizado de errores
 * Proporciona funciones para mostrar errores consistentes en la UI
 */

import { showNotification } from "./notifications.js";

// Tipos de errores comunes
const ERROR_TYPES = {
  AUTH: "auth",
  NETWORK: "network",
  ROUTING: "routing",
  FIRESTORE: "firestore",
  UNKNOWN: "unknown",
};

/**
 * Muestra una página de error en el contenido principal
 * @param {string} title - Título del error
 * @param {Error|string} error - Objeto de error o mensaje
 * @param {HTMLElement} [container] - Contenedor donde mostrar el error (opcional)
 */
export function showErrorPage(
  title,
  error,
  container = document.getElementById("app-main-content")
) {
  const errorMessage = typeof error === "string" ? error : error.message;
  const errorCode = error.code || "UNKNOWN";

  const errorHtml = `
    <div class="error-page">
      <div class="error-content">
        <h2>${title}</h2>
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--color-danger)">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <p class="error-message">${errorMessage}</p>
        <p class="error-code">Código: ${errorCode}</p>
        <div class="error-actions">
          <button class="btn-primary" id="reload-button">Recargar Aplicación</button>
          <button class="btn-secondary" id="home-button">Volver al Inicio</button>
        </div>
      </div>
    </div>
  `;

  if (container) {
    container.innerHTML = errorHtml;

    // Agregar event listeners a los botones
    document.getElementById("reload-button")?.addEventListener("click", () => {
      window.location.reload();
    });

    document.getElementById("home-button")?.addEventListener("click", () => {
      window.location.hash = "#home";
    });
  }

  // También mostrar notificación
  showNotification(`Error: ${title}`, "error");
}

/**
 * Determina el tipo de error para manejo específico
 * @param {Error} error
 * @returns {string} Tipo de error
 */
export function getErrorType(error) {
  if (!error) return ERROR_TYPES.UNKNOWN;

  if (error.code) {
    if (error.code.startsWith("auth/")) return ERROR_TYPES.AUTH;
    if (error.code.startsWith("firestore/")) return ERROR_TYPES.FIRESTORE;
  }

  if (error.message.includes("Network Error")) return ERROR_TYPES.NETWORK;
  if (error.message.includes("Failed to fetch")) return ERROR_TYPES.NETWORK;

  return ERROR_TYPES.UNKNOWN;
}

/**
 * Maneja errores de Firebase Auth con mensajes amigables
 * @param {Error} error
 * @returns {string} Mensaje traducido
 */
export function handleAuthError(error) {
  switch (error.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Credenciales incorrectas. Por favor verifica tus datos.";
    case "auth/email-already-in-use":
      return "Este correo ya está registrado. ¿Quieres iniciar sesión?";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/network-request-failed":
      return "Problema de conexión. Verifica tu internet.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Por favor espera e intenta más tarde.";
    default:
      return "Error en la autenticación. Por favor intenta nuevamente.";
  }
}

/**
 * Logger para errores (puede extenderse para enviar a servicios como Sentry)
 * @param {Error} error
 * @param {string} context - Contexto donde ocurrió el error
 */
export function logError(error, context = "") {
  const errorType = getErrorType(error);
  const timestamp = new Date().toISOString();

  console.groupCollapsed(
    `[${timestamp}] Error en ${context || "contexto desconocido"}`
  );
  console.error(`Tipo: ${errorType}`);
  console.error("Mensaje:", error.message);
  console.error("Stack:", error.stack);
  if (error.code) console.error("Código:", error.code);
  console.groupEnd();

  // Aquí podrías agregar envío a un servicio de monitoreo
  // sendErrorToMonitoring(error, context);
}

export default {
  showErrorPage,
  getErrorType,
  handleAuthError,
  logError,
  ERROR_TYPES,
};
