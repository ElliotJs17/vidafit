import { db } from "../config/firebase.config.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

class ProfileService {
  static async getUserProfile(userId) {
    try {
      const profileRef = doc(db, "users", userId);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        return profileSnap.data();
      } else {
        // Crear un perfil básico si no existe
        const basicProfile = {
          displayName: "",
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        await setDoc(profileRef, basicProfile);
        return basicProfile;
      }
    } catch (error) {
      console.error("Error getting profile:", error);
      throw error;
    }
  }

  static async updateUserProfile(userId, profileData) {
    try {
      const profileRef = doc(db, "users", userId);
      await setDoc(profileRef, profileData, { merge: true });

      // Actualizar el avatar en el header si corresponde
      if (profileData.avatarUrl) {
        const headerAvatar = document.getElementById("header-avatar");
        if (headerAvatar) {
          headerAvatar.src = profileData.avatarUrl;
        }
      }

      // Actualizar el nombre en el header si corresponde
      if (profileData.displayName) {
        const headerName = document.querySelector(".username");
        if (headerName) {
          headerName.textContent = profileData.displayName;
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  static async uploadAvatar(userId, file) {
    try {
      const storage = getStorage();

      // Eliminar avatar anterior si existe
      try {
        const oldAvatarRef = ref(storage, `avatars/${userId}`);
        await deleteObject(oldAvatarRef);
      } catch (error) {
        // No hacer nada si no existe el archivo anterior
        if (error.code !== "storage/object-not-found") {
          throw error;
        }
      }

      // Subir nuevo avatar
      const storageRef = ref(storage, `avatars/${userId}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }
}

export default ProfileService;
