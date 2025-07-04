// 📁 public/js/pages/entrenamientos/managers/SelectionManager.js
// ✅ Manejo de selección de entrenamientos
export class SelectionManager {
  constructor() {
    this.seleccionados = new Set();
    this.callbacks = {
      onSelectionChange: null,
      onCounterUpdate: null
    };
  }

  // ✅ Configurar callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // ✅ Toggle selección
  toggle(id) {
    if (this.seleccionados.has(id)) {
      this.seleccionados.delete(id);
    } else {
      this.seleccionados.add(id);
    }

    this.notificarCambio();
  }

  // ✅ Obtener seleccionados
  obtenerSeleccionados() {
    return Array.from(this.seleccionados);
  }

  // ✅ Limpiar selección
  limpiar() {
    this.seleccionados.clear();
    this.notificarCambio();
  }

  // ✅ Verificar si está seleccionado
  estaSeleccionado(id) {
    return this.seleccionados.has(id);
  }

  // ✅ Obtener cantidad
  obtenerCantidad() {
    return this.seleccionados.size;
  }

  // ✅ Notificar cambios
  notificarCambio() {
    if (this.callbacks.onSelectionChange) {
      this.callbacks.onSelectionChange(this.obtenerSeleccionados());
    }
    if (this.callbacks.onCounterUpdate) {
      this.callbacks.onCounterUpdate(this.obtenerCantidad());
    }
  }
}