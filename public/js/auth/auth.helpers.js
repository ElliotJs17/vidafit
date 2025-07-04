/**
 * Helper functions para manejo de errores de autenticación
 */
export class AuthHelpers {
  /**
   * Obtiene un mensaje de error amigable para el usuario
   * @param {Error} error
   * @returns {string}
   */
  static getFriendlyErrorMessage(error) {
    switch (error.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Correo o contraseña incorrectos.";
      case "auth/email-already-in-use":
        return "El correo electrónico ya está registrado.";
      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres.";
      case "auth/invalid-email":
        return "El formato del correo electrónico es inválido.";
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Por favor, espera un momento.";
      default:
        return "Ocurrió un error. Por favor, inténtalo de nuevo.";
    }
  }

  /**
   * Valida los campos del formulario de registro
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} confirmPassword
   * @returns {string|null} Mensaje de error o null si es válido
   */
  static validateRegisterFields(name, email, password, confirmPassword) {
    if (!name || !email || !password || !confirmPassword) {
      return "Por favor, completa todos los campos.";
    }

    if (password !== confirmPassword) {
      return "Las contraseñas no coinciden.";
    }

    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    return null;
  }
}
