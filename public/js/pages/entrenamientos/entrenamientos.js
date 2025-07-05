// 📁 public/js/pages/entrenamientos/entrenamientos.js
// ✅ Archivo principal de la página de entrenamientos
import { EntrenamientosManager } from './managers/EntrenamientosManager.js';

let entrenamientosManager;

// ✅ Función principal que se ejecuta al cargar la página
export default async function inicializarEntrenamientos() {
  console.log("🏋️ Inicializando módulo de entrenamientos...");
  
  try {
    entrenamientosManager = new EntrenamientosManager();
    await entrenamientosManager.init();
    
    // Exponer métodos para depuración
    window.verificarConexionFirebase = () => {
      entrenamientosManager?.verificarConexionFirebase();
    };
    
    console.log("✅ Módulo de entrenamientos inicializado correctamente");
    
  } catch (error) {
    console.error("❌ Error inicializando módulo de entrenamientos:", error);
  }
}

// ✅ Exportar funciones para uso externo
export function renderEntrenamientos(lista) {
  entrenamientosManager?.renderEntrenamientos(lista);
}

export function getEntrenamientosManager() {
  return entrenamientosManager;
}

export function getEntrenamientosSeleccionados() {
  return entrenamientosManager?.obtenerSeleccionados() || [];
}

export function limpiarSeleccion() {
  entrenamientosManager?.limpiarSeleccion();
}
