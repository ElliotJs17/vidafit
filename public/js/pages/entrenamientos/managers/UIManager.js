// 📁 public/js/pages/entrenamientos/managers/UIManager.js
// ✅ Manejo de interfaz de usuario
export class UIManager {
  constructor(elementos) {
    this.elementos = elementos;
  }

  // ✅ Actualizar contador
  actualizarContador(cantidad) {
    if (this.elementos.contadorNumero) {
      this.elementos.contadorNumero.textContent = cantidad;
    }

    if (this.elementos.guardarBtn) {
      this.elementos.guardarBtn.disabled = cantidad === 0;
    }
  }

  // ✅ Actualizar vista previa
  actualizarVistaPrevia(entrenamientos) {
    if (!this.elementos.vistaPrevia) return;

    if (entrenamientos.length === 0) {
      this.elementos.vistaPrevia.innerHTML = 
        `<div class="rutina-empty">Selecciona entrenamientos para crear tu rutina</div>`;
      return;
    }

    const previews = entrenamientos
      .map(entrenamiento => `
        <div class="entrenamiento-preview">
          <div class="preview-titulo">${entrenamiento.nombre}</div>
          <div class="preview-descripcion">${entrenamiento.duracion || 0} min • ${entrenamiento.dificultad || 'N/A'}</div>
        </div>`)
      .join("");

    this.elementos.vistaPrevia.innerHTML = previews;
  }

  // ✅ Actualizar selección visual
  actualizarSeleccionVisual(id, seleccionado) {
    const card = document.querySelector(`#check-${id}`)?.closest(".entrenamiento-card");
    const checkbox = document.querySelector(`#check-${id}`);

    if (card) {
      card.classList.toggle("seleccionado", seleccionado);
    }

    if (checkbox) {
      checkbox.checked = seleccionado;
    }
  }

  // ✅ Limpiar selección visual
  limpiarSeleccionVisual() {
    document.querySelectorAll(".entrenamiento-card").forEach(card => {
      card.classList.remove("seleccionado");
    });
    document.querySelectorAll(".entrenamiento-checkbox").forEach(checkbox => {
      checkbox.checked = false;
    });
  }
}