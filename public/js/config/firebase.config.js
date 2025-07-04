import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, collection } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDkV29gpX_ps_ieruFjrQGeSwF0HC7pTR0",
  authDomain: "vidafit-app.firebaseapp.com",
  projectId: "vidafit-app",
  storageBucket: "vidafit-app.appspot.com", // ✅ corregido
  messagingSenderId: "822862982948",
  appId: "1:822862982948:web:374e2565818f2c23224db1",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportar servicios y colecciones
const entrenamientosCollection = collection(db, "entrenamientos");
export { app, auth, db, storage, entrenamientosCollection };
