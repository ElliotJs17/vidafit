// 📁 public/js/pages/entrenamientos/services/storageService.js
// ✅ Manejo del almacenamiento local
export class StorageService {
  // ✅ Guardar rutina en localStorage
  guardarRutina(rutina) {
    try {
      localStorage.setItem("rutina-personalizada", JSON.stringify(rutina));
      return { success: true };
    } catch (error) {
      console.error("❌ Error guardando rutina:", error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Obtener rutina guardada
  obtenerRutina() {
    try {
      const rutina = localStorage.getItem("rutina-personalizada");
      return rutina ? JSON.parse(rutina) : null;
    } catch (error) {
      console.error("❌ Error obteniendo rutina:", error);
      return null;
    }
  }

  // ✅ Limpiar rutina guardada
  limpiarRutina() {
    try {
      localStorage.removeItem("rutina-personalizada");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}