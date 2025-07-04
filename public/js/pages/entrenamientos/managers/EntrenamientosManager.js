// 📁 public/js/pages/entrenamientos/managers/EntrenamientosManager.js
// ✅ Manager principal que coordina todas las funcionalidades
import { FirebaseService } from '../services/firebaseService.js';
import { StorageService } from '../services/storageService.js';
import { EntrenamientoCard } from '../components/EntrenamientoCard.js';
import { DOMUtils } from '../utils/domUtils.js';
import { SelectionManager } from './SelectionManager.js';
import { FilterManager } from './FilterManager.js';
import { UIManager } from './UIManager.js';
import { NotificationManager } from '../utils/notifications.js';

export class EntrenamientosManager {
  constructor() {
    this.entrenamientos = [];
    this.elementos = null;
    
    // Inicializar managers
    this.firebaseService = new FirebaseService();
    this.storageService = new StorageService();
    this.selectionManager = new SelectionManager();
    this.filterManager = new FilterManager();
    this.uiManager = null; // Se inicializa después de obtener elementos
  }

  // ✅ Inicializar
  async init() {
    try {
      this.initializeDOM();
      this.initializeManagers();
      this.setupEventListeners();
      await this.cargarEntrenamientos();
    } catch (error) {
      console.error("❌ Error inicializando EntrenamientosManager:", error);
      NotificationManager.mostrarError("Error al inicializar la aplicación");
    }
  }

  // ✅ Inicializar DOM
  initializeDOM() {
    this.elementos = DOMUtils.obtenerElementos();
    this.uiManager = new UIManager(this.elementos);
  }

  // ✅ Inicializar managers
  initializeManagers() {
    this.selectionManager.setCallbacks({
      onSelectionChange: (seleccionados) => this.onSelectionChange(seleccionados),
      onCounterUpdate: (cantidad) => this.uiManager.actualizarContador(cantidad)
    });
  }

  // ✅ Configurar event listeners
  setupEventListeners() {
    // Event delegation para checkboxes
    this.elementos.listaContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('entrenamiento-checkbox')) {
        const id = e.target.dataset.entrenamientoId;
        this.toggleEntrenamiento(id);
      }
    });

    // Event delegation para filtros
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('filtro-btn')) {
        e.preventDefault();
        const tipo = e.target.dataset.tipo;
        this.filterManager.aplicarFiltro(tipo);
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

  // ✅ Cargar entrenamientos
  async cargarEntrenamientos() {
    try {
      const lista = await this.firebaseService.obtenerEntrenamientos();
      this.entrenamientos = lista;
      
      if (lista.length === 0) {
        DOMUtils.mostrarVacio(this.elementos.listaContainer, "No hay entrenamientos disponibles.");
        return;
      }

      this.renderEntrenamientos(lista);
      console.log("✅ Entrenamientos cargados:", lista);
    } catch (error) {
      console.error("❌ Error cargando entrenamientos:", error);
      DOMUtils.mostrarError(this.elementos.listaContainer, "Error al cargar entrenamientos.");
    }
  }

  // ✅ Renderizar entrenamientos
  renderEntrenamientos(lista) {
    if (!this.elementos.listaContainer || !lista || lista.length === 0) return;

    const fragment = document.createDocumentFragment();
    const tieneSeleccion = this.elementos.contadorNumero || this.elementos.vistaPrevia;

    lista.forEach((entrenamiento) => {
      const isSelected = this.selectionManager.estaSeleccionado(entrenamiento.id);
      const card = new EntrenamientoCard(entrenamiento, isSelected, tieneSeleccion);
      fragment.appendChild(card.crear());
    });

    this.elementos.listaContainer.innerHTML = "";
    this.elementos.listaContainer.appendChild(fragment);
  }

  // ✅ Toggle entrenamiento
  toggleEntrenamiento(id) {
    this.selectionManager.toggle(id);
    const seleccionado = this.selectionManager.estaSeleccionado(id);
    this.uiManager.actualizarSeleccionVisual(id, seleccionado);
  }

  // ✅ Callback cuando cambia la selección
  onSelectionChange(seleccionados) {
    const entrenamientosSeleccionados = seleccionados
      .map(id => this.entrenamientos.find(e => e.id === id))
      .filter(Boolean);
    
    this.uiManager.actualizarVistaPrevia(entrenamientosSeleccionados);
  }

  // ✅ Guardar rutina
  guardarRutina() {
    const nombre = this.elementos.nombreRutina?.value || "Mi Rutina";
    const seleccionados = this.selectionManager.obtenerSeleccionados();
    
    const entrenamientosSeleccionados = seleccionados
      .map(id => this.entrenamientos.find(e => e.id === id))
      .filter(Boolean);

    const rutina = {
      nombre,
      entrenamientos: entrenamientosSeleccionados,
      fecha: new Date().toISOString(),
    };

    const resultado = this.storageService.guardarRutina(rutina);
    
    if (resultado.success) {
      NotificationManager.mostrarExito(`✅ Rutina "${nombre}" guardada exitosamente!`);
    } else {
      NotificationManager.mostrarError("Error al guardar la rutina");
    }
  }

  // ✅ Métodos públicos
  async verificarConexionFirebase() {
    const resultado = await this.firebaseService.verificarConexion();
    
    if (resultado.success) {
      if (resultado.count > 0) {
        NotificationManager.mostrarExito(`✅ Conexión exitosa. Se encontraron ${resultado.count} entrenamientos.`);
      } else {
        NotificationManager.mostrarAdvertencia("⚠️ Conexión establecida pero no se encontraron datos.");
      }
    } else {
      NotificationManager.mostrarError("❌ Error al conectar con Firebase. Revisa la consola.");
    }
  }

  obtenerSeleccionados() {
    const seleccionados = this.selectionManager.obtenerSeleccionados();
    return seleccionados
      .map(id => this.entrenamientos.find(e => e.id === id))
      .filter(Boolean);
  }

  limpiarSeleccion() {
    this.selectionManager.limpiar();
    this.uiManager.limpiarSeleccionVisual();
  }
}
