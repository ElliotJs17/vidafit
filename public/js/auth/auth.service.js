import { auth } from "../config/firebase.config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

/**
 * Servicio de autenticación que maneja todas las operaciones relacionadas con Firebase Auth
 */
class AuthService {
  /**
   * Inicia sesión con email y contraseña
   * @param {string} email
   * @param {string} password
   * @returns {Promise<UserCredential>}
   */
  static async signIn(email, password) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario
   * @param {string} email
   * @param {string} password
   * @returns {Promise<UserCredential>}
   */
  static async register(email, password) {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  /**
   * Cierra la sesión actual
   * @returns {Promise<void>}
   */
  static async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  /**
   * Verifica el estado de autenticación
   * @returns {Promise<User|null>}
   */
  static async checkAuthState() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          resolve(user);
        },
        (error) => {
          unsubscribe();
          reject(error);
        }
      );
    });
  }

  /**
   * Actualiza el perfil del usuario
   * @param {User} user
   * @param {Object} profileData
   * @returns {Promise<void>}
   */
  static async updateProfile(user, profileData) {
    try {
      await updateProfile(user, profileData);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }
}

export default AuthService;
