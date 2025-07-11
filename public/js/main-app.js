import AuthService from "./auth/auth.service.js";
import { showErrorPage } from "./utils/error-handler.js";
import ProfileService from "./services/profile.service.js";

// Configuración de rutas
const ROUTES = {
  home: {
    template: "./templates/home.html",
    styles: "./css/pages/home.css",
    script: "./pages/home/home.js",
  },
  "mi-plan": {
    template: "./templates/mi-plan.html",
    styles: "./css/pages/mi-plan.css",
    script: "./pages/mi-plan/mi-plan.js",
  },
  recetas: {
    template: "./templates/recetas.html",
    styles: "./css/pages/recetas.css",
    script: "./pages/recetas/recetas.js",
  },
  entrenamientos: {
    template: "./templates/entrenamientos.html",
    styles: "./css/pages/entrenamientos.css",
    script: "./pages/entrenamientos/entrenamientos.js",
  },
  perfil: {
    template: "./templates/perfil.html",
    styles: "./css/pages/perfil.css",
    script: "./pages/perfil/perfil.js",
  },
  ayudaInteligente: {
    template: "./templates/ayudaInteligente.html",
    styles: "./css/pages/ayudaInteligente.css",
    script: "./pages/ayudaInteligente/ayudaInteligente.js",
  },
};

class AppRouter {
  constructor() {
    this.mainContent = document.getElementById("app-main-content");
    this.currentPage = null;
    this.currentModule = null; // Asegurarnos de que esta propiedad existe
    this.headerAvatar = document.getElementById("header-avatar");
    this.init();
  }

  async init() {
    await this.checkAuthentication();
    this.setupEventListeners();
    this.navigateTo("home");
  }

  async checkAuthentication() {
    try {
      const user = await AuthService.checkAuthState();
      const isLoginPage = window.location.pathname.includes("index.html");

      if (!user && !isLoginPage) {
        window.location.href = "index.html";
        return;
      }

      if (user) {
        const username = user.displayName || user.email.split("@")[0];
        document.getElementById(
          "user-display-name"
        ).innerHTML = `Hola, <span class="username">${username}</span>`;

        try {
          const userProfile = await ProfileService.getUserProfile(user.uid);
          const avatarImg = document.getElementById("header-avatar");

          // 1. Manejo del nombre
          if (userProfile?.displayName) {
            document.querySelector(".username").textContent =
              userProfile.displayName;
          }

          // 2. Manejo del avatar con solución para problemas de caché
          if (userProfile?.avatarUrl) {
            const timestamp = new Date().getTime();
            avatarImg.src = `${userProfile.avatarUrl}?t=${timestamp}`;

            localStorage.setItem("lastAvatarUrl", userProfile.avatarUrl);
          } else if (localStorage.getItem("lastAvatarUrl")) {
            avatarImg.src = localStorage.getItem("lastAvatarUrl");
          } else {
            avatarImg.src = "img/pages/perfil/avatar-placeholder.gif";
          }
        } catch (profileError) {
          console.error("Error loading profile:", profileError);
          const lastAvatar = localStorage.getItem("lastAvatarUrl");
          if (lastAvatar) {
            document.getElementById("header-avatar").src = lastAvatar;
          }
        }
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      if (!window.location.pathname.includes("index.html")) {
        window.location.href = "index.html";
      }
    }
  }

  setupEventListeners() {
    // Logout
    document
      .getElementById("logout-button")
      .addEventListener("click", async () => {
        try {
          await AuthService.signOut();
          window.location.href = "index.html";
        } catch (error) {
          showErrorPage("Error al cerrar sesión", error);
        }
      });

    // Navigation
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-page]");
      if (link) {
        e.preventDefault();
        this.navigateTo(link.dataset.page);
      }
    });
  }

  async navigateTo(pageName) {
    if (this.currentPage === pageName) return;

    try {
      // Limpiar completamente el estado anterior
      await this.cleanupPreviousPage();
      this.currentPage = pageName;
      this.updateActiveNavLink(pageName);

      const route = ROUTES[pageName];
      if (!route) throw new Error("Página no encontrada");

      // Mostrar loader mientras carga
      this.mainContent.innerHTML = '<div class="page-loader">Cargando...</div>';

      // Cargar template
      const response = await fetch(route.template);
      if (!response.ok) throw new Error("Template no encontrado");
      this.mainContent.innerHTML = await response.text();

      // Cargar estilos
      this.loadStyles(route.styles);

      // Cargar script del módulo
      await this.loadModule(route.script);
    } catch (error) {
      console.error(`Error loading page ${pageName}:`, error);
      showErrorPage(`Error al cargar ${pageName}`, error);
    }
  }

  async cleanupPreviousPage() {
    // Limpiar módulo anterior
    if (
      this.currentModule &&
      typeof this.currentModule.cleanup === "function"
    ) {
      await this.currentModule.cleanup();
      this.currentModule = null;
    }

    // Limpiar event listeners específicos de la página
    this.mainContent.innerHTML = "";

    // Cancelar cualquier solicitud pendiente de Firebase
    // (Esto depende de cómo implementes tus queries)
    if (window.activeFirebaseQueries) {
      window.activeFirebaseQueries.forEach((query) => {
        if (query && typeof query === "function") query();
      });
      window.activeFirebaseQueries = [];
    }
  }

  updateActiveNavLink(pageName) {
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === pageName);
    });
  }

  loadStyles(href) {
    // Remover estilos anteriores
    const oldStyle = document.getElementById("dynamic-style");
    if (oldStyle) oldStyle.remove();

    // Agregar nuevos estilos
    const link = document.createElement("link");
    link.id = "dynamic-style";
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  async loadModule(modulePath) {
    // Limpiar módulo anterior
    if (this.currentModule) {
      if (typeof this.currentModule.cleanup === "function") {
        this.currentModule.cleanup();
      }
      this.currentModule = null;
    }

    try {
      const module = await import(modulePath);
      if (typeof module.default === "function") {
        this.currentModule = await module.default(); // Asegurar el await aquí
      }
    } catch (error) {
      console.warn(
        `Module ${modulePath} not found or has no default export:`,
        error
      );
    }
  }
}

// Iniciar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  new AppRouter();
});
