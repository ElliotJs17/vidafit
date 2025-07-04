// ✅ Importar configuración existente de Firebase
import { db, entrenamientosCollection } from "../../config/firebase.config.js";
import { getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// 🧠 Clase para manejar el estado y funcionalidad de entrenamientos
class EntrenamientosManager {
  constructor() {
    this.entrenamientos = [];
    this.entrenamientosSeleccionados = new Set();
    this.elementos = {
      listaContainer: null,
      contadorNumero: null,
      vistaPrevia: null,
      nombreRutina: null,
      guardarBtn: null
    };
  }

  // ✅ Inicializar elementos del DOM y eventos
  async init() {
    try {
      this.initializeDOM();
      this.setupEventListeners();
      await this.cargarEntrenamientos();
    } catch (error) {
      console.error("❌ Error inicializando EntrenamientosManager:", error);
      this.mostrarError("Error al inicializar la aplicación");
    }
  }

  // ✅ Inicializar elementos del DOM
  initializeDOM() {
    this.elementos.listaContainer = document.getElementById("lista-entrenamientos");
    this.elementos.contadorNumero = document.querySelector(".contador-numero");
    this.elementos.vistaPrevia = document.getElementById("entrenamientos-seleccionados");
    this.elementos.nombreRutina = document.getElementById("nombre-rutina");
    this.elementos.guardarBtn = document.getElementById("guardar-rutina-btn");

    if (!this.elementos.listaContainer) {
      console.warn("⚠️ No se encontró #lista-entrenamientos en el HTML.");
      throw new Error("Elemento requerido #lista-entrenamientos no encontrado");
    }
  }

  // ✅ Configurar event listeners
  setupEventListeners() {
    // Event delegation para checkboxes
    if (this.elementos.listaContainer) {
      this.elementos.listaContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('entrenamiento-checkbox')) {
          const id = e.target.dataset.entrenamientoId;
          this.toggleEntrenamiento(id);
        }
      });
    }

    // Event delegation para filtros
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('filtro-btn')) {
        e.preventDefault();
        const tipo = e.target.dataset.tipo;
        this.filtrarTipo(tipo);
      }
    });

    // Botón guardar rutina
    if (this.elementos.guardarBtn) {
      this.elementos.guardarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.guardarRutina();
      });
    }
  }

  // ✅ Obtener datos desde Firestore usando la configuración existente
  async obtenerEntrenamientos() {
    try {
      const snapshot = await getDocs(entrenamientosCollection);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("❌ Error obteniendo entrenamientos:", error);
      throw error;
    }
  }

  // ✅ Cargar entrenamientos desde Firebase
  async cargarEntrenamientos() {
    try {
      const lista = await this.obtenerEntrenamientos();
      this.entrenamientos = lista;
      
      if (lista.length === 0) {
        this.elementos.listaContainer.innerHTML = 
          "<p>No hay entrenamientos disponibles.</p>";
        return;
      }

      this.renderEntrenamientos(lista);
      console.log("✅ Entrenamientos cargados:", lista);
    } catch (error) {
      console.error("❌ Error cargando entrenamientos:", error);
      this.elementos.listaContainer.innerHTML = 
        `<p style="color: red;">Error al cargar entrenamientos.</p>`;
    }
  }

  // ✅ Renderizar entrenamientos
  renderEntrenamientos(lista) {
    console.log("Renderizando entrenamientos:", lista);
    
    if (!this.elementos.listaContainer || !lista || lista.length === 0) {
      return;
    }

    const fragment = document.createDocumentFragment();

    lista.forEach((entrenamiento) => {
      const card = this.crearTarjetaEntrenamiento(entrenamiento);
      fragment.appendChild(card);
    });

    this.elementos.listaContainer.innerHTML = "";
    this.elementos.listaContainer.appendChild(fragment);
  }

  // ✅ Crear tarjeta de entrenamiento
  crearTarjetaEntrenamiento(entrenamiento) {
    const card = document.createElement("div");
    card.className = "entrenamiento-card";
    card.dataset.tipo = entrenamiento.tipo || "general";

    const isSelected = this.entrenamientosSeleccionados.has(entrenamiento.id);
    if (isSelected) {
      card.classList.add("seleccionado");
    }

    // Verificar si tiene funcionalidad de selección o solo mostrar
    const tieneSeleccion = this.elementos.contadorNumero || this.elementos.vistaPrevia;

    card.innerHTML = `
      <div class="entrenamiento-header">
        ${tieneSeleccion ? `
          <div class="checkbox-container">
            <input type="checkbox" 
                   class="entrenamiento-checkbox" 
                   id="check-${entrenamiento.id}"
                   data-entrenamiento-id="${entrenamiento.id}"
                   ${isSelected ? 'checked' : ''}>
          </div>
        ` : ''}
        <div class="entrenamiento-info">
          <div class="entrenamiento-titulo">
            <h3>${entrenamiento.nombre}</h3>
          </div>
          ${entrenamiento.tipo ? `
            <div class="tipo-badge tipo-${entrenamiento.tipo}">${entrenamiento.tipo}</div>
          ` : ''}
          <div class="entrenamiento-descripcion">
            <p>${entrenamiento.descripcion}</p>
          </div>
          <div class="entrenamiento-stats">
            <div class="stats">
              <span class="stat-item">🔥 ${entrenamiento.calorias || 0} cal</span>
              <span class="stat-item">📊 ${entrenamiento.dificultad || 'N/A'}</span>
              <span class="stat-item">⏱️ ${entrenamiento.duracion || 0} min</span>
            </div>
          </div>
        </div>
      </div>`;

    return card;
  }

  // ✅ Toggle entrenamiento seleccionado
  toggleEntrenamiento(id) {
    const card = document.querySelector(`#check-${id}`)?.closest(".entrenamiento-card");
    if (!card) return;

    if (this.entrenamientosSeleccionados.has(id)) {
      this.entrenamientosSeleccionados.delete(id);
      card.classList.remove("seleccionado");
    } else {
      this.entrenamientosSeleccionados.add(id);
      card.classList.add("seleccionado");
    }

    this.actualizarContador();
    this.actualizarVistaPrevia();
  }

  // ✅ Filtrar por tipo
  filtrarTipo(tipo) {
    // Actualizar botones activos
    document.querySelectorAll(".filtro-btn").forEach((btn) => {
        btn.classList.remove("activo");
    });

    const botonActivo = document.querySelector(`[data-tipo="${tipo}"]`);
    if (botonActivo) {
        botonActivo.classList.add("activo");
    }

    // Filtrar tarjetas por nombre o tipo
    document.querySelectorAll(".entrenamiento-card").forEach((card) => {
        const tipoEntrenamiento = card.dataset.tipo?.toLowerCase() || "";
        const nombreEntrenamiento = card.querySelector("h3")?.textContent.toLowerCase() || "";

        const mostrar = tipo === "todos" ||
        tipoEntrenamiento.includes(tipo.toLowerCase()) ||
        nombreEntrenamiento.includes(tipo.toLowerCase());

        card.style.display = mostrar ? "block" : "none";
    });
  }

  // ✅ Actualizar contador
  actualizarContador() {
    if (this.elementos.contadorNumero) {
      this.elementos.contadorNumero.textContent = this.entrenamientosSeleccionados.size;
    }

    if (this.elementos.guardarBtn) {
      this.elementos.guardarBtn.disabled = this.entrenamientosSeleccionados.size === 0;
    }
  }

  // ✅ Actualizar vista previa
  actualizarVistaPrevia() {
    if (!this.elementos.vistaPrevia) return;

    if (this.entrenamientosSeleccionados.size === 0) {
      this.elementos.vistaPrevia.innerHTML = 
        `<div class="rutina-empty">Selecciona entrenamientos para crear tu rutina</div>`;
      return;
    }

    const previews = Array.from(this.entrenamientosSeleccionados)
      .map(id => {
        const entrenamiento = this.entrenamientos.find(e => e.id === id);
        return entrenamiento ? `
          <div class="entrenamiento-preview">
            <div class="preview-titulo">${entrenamiento.nombre}</div>
            <div class="preview-descripcion">${entrenamiento.duracion || 0} min • ${entrenamiento.dificultad || 'N/A'}</div>
          </div>` : '';
      })
      .filter(Boolean)
      .join("");

    this.elementos.vistaPrevia.innerHTML = previews;
  }

  // ✅ Guardar rutina
  guardarRutina() {
    const nombre = this.elementos.nombreRutina?.value || "Mi Rutina";
    
    const entrenamientosSeleccionados = Array.from(this.entrenamientosSeleccionados)
      .map(id => this.entrenamientos.find(e => e.id === id))
      .filter(Boolean);

    const rutina = {
      nombre,
      entrenamientos: entrenamientosSeleccionados,
      fecha: new Date().toISOString(),
    };

    try {
      localStorage.setItem("rutina-personalizada", JSON.stringify(rutina));
      this.mostrarExito(`✅ Rutina "${nombre}" guardada exitosamente!`);
    } catch (error) {
      console.error("❌ Error guardando rutina:", error);
      this.mostrarError("Error al guardar la rutina");
    }
  }

  // ✅ Verificar conexión con Firebase
  async verificarConexionFirebase() {
    try {
      const datos = await this.obtenerEntrenamientos();
      if (datos.length > 0) {
        this.mostrarExito(`✅ Conexión exitosa. Se encontraron ${datos.length} entrenamientos.`);
        console.log("📂 Datos Firebase:", datos);
      } else {
        this.mostrarAdvertencia("⚠️ Conexión establecida pero no se encontraron datos.");
      }
    } catch (error) {
      this.mostrarError("❌ Error al conectar con Firebase. Revisa la consola.");
      console.error("❌ Error de conexión Firebase:", error);
    }
  }

  // ✅ Obtener entrenamientos seleccionados
  obtenerSeleccionados() {
    return Array.from(this.entrenamientosSeleccionados)
      .map(id => this.entrenamientos.find(e => e.id === id))
      .filter(Boolean);
  }

  // ✅ Limpiar selección
  limpiarSeleccion() {
    this.entrenamientosSeleccionados.clear();
    document.querySelectorAll(".entrenamiento-card").forEach(card => {
      card.classList.remove("seleccionado");
    });
    document.querySelectorAll(".entrenamiento-checkbox").forEach(checkbox => {
      checkbox.checked = false;
    });
    this.actualizarContador();
    this.actualizarVistaPrevia();
  }

  // ✅ Métodos de utilidad para mostrar mensajes
  mostrarExito(mensaje) {
    console.log(mensaje);
    // Aquí puedes integrar con tu sistema de notificaciones
    // import { showNotification } from "../utils/notifications.js";
    // showNotification(mensaje, "success");
    alert(mensaje);
  }

  mostrarError(mensaje) {
    console.error(mensaje);
    // import { showNotification } from "../utils/notifications.js";
    // showNotification(mensaje, "error");
    alert(mensaje);
  }

  mostrarAdvertencia(mensaje) {
    console.warn(mensaje);
    // import { showNotification } from "../utils/notifications.js";
    // showNotification(mensaje, "warning");
    alert(mensaje);
  }
}

// ✅ Instancia global del manager
let entrenamientosManager;

// ✅ Función principal exportada
export default async function () {
  console.log("🏋️ Script de entrenamiento cargado.");
  
  try {
    entrenamientosManager = new EntrenamientosManager();
    await entrenamientosManager.init();
    
    // Exponer método de verificación para depuración
    window.verificarConexionFirebase = () => {
      entrenamientosManager?.verificarConexionFirebase();
    };
    
    console.log("✅ EntrenamientosManager inicializado correctamente");
    
  } catch (error) {
    console.error("❌ Error en la inicialización:", error);
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