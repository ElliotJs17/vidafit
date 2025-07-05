// 📁 public/js/pages/entrenamientos/utils/notifications.js
// ✅ Sistema de notificaciones específico para entrenamientos
export class NotificationManager {
  // ✅ Mostrar éxito
  static mostrarExito(mensaje) {
    console.log(mensaje);
    // Integrar con el sistema global de notificaciones si existe
    // import { showNotification } from '../../../utils/notifications.js';
    // showNotification(mensaje, 'success');
    alert(mensaje);
  }

  // ✅ Mostrar error
  static mostrarError(mensaje) {
    console.error(mensaje);
    // import { showNotification } from '../../../utils/notifications.js';
    // showNotification(mensaje, 'error');
    alert(mensaje);
  }

  // ✅ Mostrar advertencia
  static mostrarAdvertencia(mensaje) {
    console.warn(mensaje);
    // import { showNotification } from '../../../utils/notifications.js';
    // showNotification(mensaje, 'warning');
    alert(mensaje);
  }
}