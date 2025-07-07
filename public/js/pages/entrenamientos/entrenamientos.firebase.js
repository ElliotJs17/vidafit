// public/js/pages/entrenamientos/entrenamientos.firebase.js

import { showError, handleNetworkError } from "./entrenamientos.utils.js";

let db;
let entrenamientosCollection;

export async function initFirestore() {
  if (db) {
    return true;
  }
  try {
    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"
    );
    const { getFirestore, collection } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );
    const firebaseConfig = {
      apiKey: "AIzaSyDkV29gpX_ps_ieruFjrQGeSwF0HC7pTR0",
      authDomain: "vidafit-app.firebaseapp.com",
      projectId: "vidafit-app",
      storageBucket: "vidafit-app.firebasestorage.app",
      messagingSenderId: "822862982948",
      appId: "1:822862982948:web:374e2565818f2c23224db1",
    };

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    entrenamientosCollection = collection(db, "entrenamientos");
    console.log("Firebase inicializado correctamente");

    return true;
  } catch (error) {
    console.error("Error inicializando Firebase:", error);
    handleNetworkError(error);
    return false;
  }
}

export function getEntrenamientosCollection() {
  return entrenamientosCollection;
}

export function getDb() {
  return db;
}

export async function uploadImageToStorage(entrenamientoId, file) {
  if (!file) return null;

  try {
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js"
    );

    const storage = getStorage();
    const storageRef = ref(
      storage,
      `entrenamientos/${entrenamientoId}/${file.name}`
    );
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    showError("Error al subir la imagen");
    return null;
  }
}
