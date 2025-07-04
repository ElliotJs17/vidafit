// 📁 public/js/pages/entrenamientos/utils/domUtils.js
// ✅ Utilidades para manipulación del DOM
export class DOMUtils {
  // ✅ Obtener elementos del DOM con validación
  static obtenerElementos() {
    const elementos = {
      listaContainer: document.getElementById("lista-entrenamientos"),
      contadorNumero: document.querySelector(".contador-numero"),
      vistaPrevia: document.getElementById("entrenamientos-seleccionados"),
      nombreRutina: document.getElementById("nombre-rutina"),
      guardarBtn: document.getElementById("guardar-rutina-btn")
    };

    // Validar elementos críticos
    if (!elementos.listaContainer) {
      throw new Error("Elemento requerido #lista-entrenamientos no encontrado");
    }

    return elementos;
  }

  // ✅ Mostrar mensaje de error en container
  static mostrarError(container, mensaje) {
    if (container) {
      container.innerHTML = `<p style="color: red;">${mensaje}</p>`;
    }
  }

  // ✅ Mostrar mensaje vacío en container
  static mostrarVacio(container, mensaje) {
    if (container) {
      container.innerHTML = `<p>${mensaje}</p>`;
    }
  }
}