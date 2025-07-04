/**
 * Módulo para mostrar notificaciones al usuario
 * (Toast messages)
 */

// Estilos inyectados para las notificaciones
const style = document.createElement("style");
style.textContent = `
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .notification {
    padding: 15px 20px;
    border-radius: var(--border-radius);
    color: white;
    box-shadow: var(--shadow-md);
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateX(110%);
    transition: transform 0.3s ease;
    max-width: 300px;
  }
  
  .notification.show {
    transform: translateX(0);
  }
  
  .notification.success {
    background-color: var(--color-primary);
  }
  
  .notification.error {
    background-color: var(--color-danger);
  }
  
  .notification.warning {
    background-color: #f59e0b;
  }
  
  .notification svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;
document.head.appendChild(style);

// Contenedor para notificaciones
const container = document.createElement("div");
container.className = "notification-container";
document.body.appendChild(container);

/**
 * Muestra una notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {'success'|'error'|'warning'} type - Tipo de notificación
 * @param {number} [duration=5000] - Duración en milisegundos (0 = permanente)
 */
export function showNotification(message, type = "success", duration = 5000) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  // Icono según tipo
  let iconPath = "";
  switch (type) {
    case "success":
      iconPath = "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z";
      break;
    case "error":
      iconPath =
        "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z";
      break;
    case "warning":
      iconPath = "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z";
      break;
  }

  notification.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
      <path d="${iconPath}"/>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(notification);

  // Forzar reflow para activar la animación
  void notification.offsetWidth;
  notification.classList.add("show");

  // Auto-eliminar después de la duración
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  // Clic para eliminar
  notification.addEventListener("click", () => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  });
}
