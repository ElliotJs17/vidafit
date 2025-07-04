// public/js/pages/recetas/recetas.utils.js

import { CATEGORIAS, DIFICULTAD } from "./recetas.constants.js";

export const utils = {
  showElement: (element, show = true) => {
    if (element) {
      element.style.display = show ? "block" : "none";
    }
  },

  showLoading: (elements) => {
    utils.showElement(elements.loadingState);
    utils.showElement(elements.emptyState, false);
    utils.showElement(elements.noResults, false);
    utils.showElement(elements.resultsInfo, false);
  },

  hideLoading: (elements) => {
    utils.showElement(elements.loadingState, false);
  },

  showEmpty: (elements) => {
    utils.showElement(elements.emptyState);
    utils.showElement(elements.noResults, false);
    utils.showElement(elements.resultsInfo, false);
  },

  showNoResults: (elements) => {
    utils.showElement(elements.noResults);
    utils.showElement(elements.emptyState, false);
    utils.showElement(elements.resultsInfo, false);
  },

  showResults: (elements, count) => {
    utils.showElement(elements.resultsInfo);
    if (elements.resultsCount) {
      elements.resultsCount.textContent = count;
    }
    utils.showElement(elements.emptyState, false);
    utils.showElement(elements.noResults, false);
  },

  formatTime: (minutes) => {
    if (!minutes || minutes < 0) return "N/A";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  },

  getCategoryEmoji: (categoria) => {
    return CATEGORIAS[categoria] || "🍳";
  },

  getDifficultyStars: (dificultad) => {
    return DIFICULTAD[dificultad] || "⭐";
  },

  truncateText: (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  },

  debounce: (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  sanitizeInput: (input) => {
    if (typeof input !== "string") return input;
    return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },
};

// Notificaciones
export function showNotification(message, type = "error") {
  const notification = document.createElement("div");
  const icon = type === "error" ? "❌" : "✅";
  const className = `${type}-notification`;

  notification.className = className;
  notification.innerHTML = `
    <div class="${type}-content">
      <span class="${type}-icon">${icon}</span>
      <span class="${type}-message">${message}</span>
    </div>
  `;

  if (!document.querySelector(`.${className}-styles`)) {
    const style = document.createElement("style");
    style.className = `${className}-styles`;
    style.textContent = `
      .${className} {
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "error" ? "#e74c3c" : "#27ae60"};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
      }
      .${className}-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), type === "error" ? 5000 : 3000);
}

export function showError(message) {
  showNotification(message, "error");
}

export function showSuccess(message) {
  showNotification(message, "success");
}

export function handleNetworkError(error) {
  console.error("Error de red:", error);

  const errorMessages = {
    unavailable: "No hay conexión a internet. Verifica tu conexión.",
    "permission-denied": "Sin permisos para acceder a los datos.",
    "not-found": "El recurso solicitado no fue encontrado.",
    default: "Error de conexión. Intenta nuevamente.",
  };

  const message = errorMessages[error.code] || errorMessages.default;
  showError(message);
}
