import AuthService from "./auth.service.js";
import { AuthHelpers } from "./auth.helpers.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const DOM = {
    loginForm: document.getElementById("login-form"),
    registerForm: document.getElementById("register-form"),
    toggleFormLink: document.getElementById("toggle-form-link"),
    toggleText: document.getElementById("toggle-text"),
    formTitle: document.getElementById("form-title"),
    formSubtitle: document.getElementById("form-subtitle"),
    loginEmail: document.getElementById("login-email"),
    loginPassword: document.getElementById("login-password"),
    registerName: document.getElementById("register-name"),
    registerEmail: document.getElementById("register-email"),
    registerPassword: document.getElementById("register-password"),
    confirmPassword: document.getElementById("confirm-password"),
  };

  let isLoginFormActive = true;

  // Verificar autenticación al cargar
  checkAuthentication();

  // Manejadores de eventos
  DOM.toggleFormLink.addEventListener("click", handleToggleForm);
  DOM.loginForm.addEventListener("submit", handleLogin);
  DOM.registerForm.addEventListener("submit", handleRegister);

  /**
   * Alterna entre formularios de login y registro
   * @param {Event} e
   */
  function handleToggleForm(e) {
    e.preventDefault();
    toggleForms();
  }

  /**
   * Maneja el envío del formulario de login
   * @param {Event} e
   */
  async function handleLogin(e) {
    e.preventDefault();

    const email = DOM.loginEmail.value;
    const password = DOM.loginPassword.value;

    if (!email || !password) {
      alert("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    try {
      await AuthService.signIn(email, password);
      window.location.href = "main-app.html";
    } catch (error) {
      alert(AuthHelpers.getFriendlyErrorMessage(error));
    }
  }

  /**
   * Maneja el envío del formulario de registro
   * @param {Event} e
   */
  async function handleRegister(e) {
    e.preventDefault();

    const name = DOM.registerName.value.trim();
    const email = DOM.registerEmail.value.trim();
    const password = DOM.registerPassword.value.trim();
    const confirmPassword = DOM.confirmPassword.value.trim();

    const validationError = AuthHelpers.validateRegisterFields(
      name,
      email,
      password,
      confirmPassword
    );

    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const userCredential = await AuthService.register(email, password);
      await AuthService.updateProfile(userCredential.user, {
        displayName: name,
      });
      window.location.href = "main-app.html";
    } catch (error) {
      alert(AuthHelpers.getFriendlyErrorMessage(error));
    }
  }

  /**
   * Alterna visualmente entre los formularios de login y registro
   */
  function toggleForms() {
    if (isLoginFormActive) {
      // Cambiar a formulario de registro
      DOM.loginForm.classList.add("hidden");
      DOM.registerForm.classList.remove("hidden");
      DOM.toggleText.textContent = "¿Ya tienes cuenta?";
      DOM.toggleFormLink.textContent = "Inicia sesión aquí";
      DOM.formTitle.textContent = "Crea tu Cuenta";
      DOM.formSubtitle.textContent =
        "Regístrate para empezar tu camino saludable.";
    } else {
      // Cambiar a formulario de login
      DOM.registerForm.classList.add("hidden");
      DOM.loginForm.classList.remove("hidden");
      DOM.toggleText.textContent = "¿No tienes cuenta?";
      DOM.toggleFormLink.textContent = "Regístrate aquí";
      DOM.formTitle.textContent = "Bienvenido a VidaFit";
      DOM.formSubtitle.textContent =
        "Tu camino hacia una vida saludable empieza aquí.";
    }
    isLoginFormActive = !isLoginFormActive;
  }

  /**
   * Verifica si el usuario ya está autenticado
   */
  async function checkAuthentication() {
    try {
      const user = await AuthService.checkAuthState();
      if (user) {
        window.location.href = "main-app.html";
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
    }
  }
});
