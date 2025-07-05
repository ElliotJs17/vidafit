
// 📁 public/js/pages/entrenamientos/services/firebaseService.js
// ✅ Manejo de todas las operaciones con Firebase
import { db, entrenamientosCollection } from "../../../config/firebase.config.js";
import { getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

export class FirebaseService {
  // ✅ Obtener entrenamientos desde Firestore
  async obtenerEntrenamientos() {
    try {
      const snapshot = await getDocs(entrenamientosCollection);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("❌ Error obteniendo entrenamientos:", error);
      throw error;
    }
  }

  // ✅ Verificar conexión con Firebase
  async verificarConexion() {
    try {
      const datos = await this.obtenerEntrenamientos();
      return {
        success: true,
        count: datos.length,
        data: datos
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}