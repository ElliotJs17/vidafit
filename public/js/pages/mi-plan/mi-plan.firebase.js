import { FIRESTORE_CONFIG } from "./mi-plan.constants.js";

let db;
let miPlanCollection;
// Declara las funciones de Firestore a nivel de módulo
let doc, setDoc, getDoc, query, where, getDocs;
let getFirestore, collection; // También declara getFirestore y collection aquí si se van a usar globalmente

export async function initFirestore() {
  if (db) return true; // Ya inicializado

  try {
    // Importaciones dinámicas de Firebase SDK
    const firebaseAppModule = await import(
      "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"
    );
    const firestoreModule = await import(
      "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"
    );

    // Asigna las funciones importadas a las variables declaradas a nivel de módulo
    ({ getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs } =
      firestoreModule);

    const firebaseConfig = {
      apiKey: "AIzaSyDkV29gpX_ps_ieruFjrQGeSwF0HC7pTR0",
      authDomain: "vidafit-app.firebaseapp.com",
      projectId: "vidafit-app",
      storageBucket: "vidafit-app.firebasestorage.app",
      messagingSenderId: "822862982948",
      appId: "1:822862982948:web:374e2565818f2c23224db1",
    };

    const app = firebaseAppModule.initializeApp(firebaseConfig);
    db = getFirestore(app);
    miPlanCollection = collection(db, FIRESTORE_CONFIG.collectionName);

    return true;
  } catch (error) {
    console.error("Error inicializando Firebase:", error);
    return false;
  }
}

export function getMiPlanCollection() {
  return miPlanCollection;
}

export async function getPlanByUserId(userId) {
  try {
    // Asegurarse de que Firestore y sus funciones estén inicializadas
    if (!db || !miPlanCollection || !query || !where || !getDocs) {
      console.warn(
        "Firestore o sus funciones no inicializadas. Intentando inicializar..."
      );
      await initFirestore();
      if (!db || !miPlanCollection || !query || !where || !getDocs) {
        throw new Error("No se pudo inicializar Firestore o sus funciones.");
      }
    }

    const q = query(miPlanCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo plan por ID de usuario:", error);
    throw error;
  }
}

export async function savePlan(plan) {
  try {
    // Asegurarse de que Firestore y sus funciones estén inicializadas
    if (!db || !miPlanCollection || !doc || !setDoc) {
      console.warn(
        "Firestore o sus funciones no inicializadas. Intentando inicializar..."
      );
      await initFirestore();
      if (!db || !miPlanCollection || !doc || !setDoc) {
        throw new Error("No se pudo inicializar Firestore o sus funciones.");
      }
    }
    const planRef = doc(miPlanCollection, plan.id);
    await setDoc(planRef, plan, { merge: true }); // Usar merge para actualizar o crear
    console.log("Plan guardado con éxito:", plan.id);
  } catch (error) {
    console.error("Error guardando plan:", error);
    throw error;
  }
}

// --- Placeholder para colecciones de recetas y entrenamientos ---
// En una aplicación real, estas funciones harían llamadas a Firestore
// para obtener los datos de tus colecciones de recetas y entrenamientos.

export async function getRecetasCollection() {
  // Simula la obtención de datos de recetas
  // En una app real: const querySnapshot = await getDocs(collection(db, "recetas"));
  // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log("Obteniendo recetas (simulado)...");
  return [
    {
      id: "receta1",
      nombre: "Ensalada César",
      imagenUrl: "https://via.placeholder.com/60?text=R1",
      calorias: 350,
      tiempoPreparacion: 15,
      macronutrientes: { proteinas: 20, carbohidratos: 15, grasas: 25 },
    },
    {
      id: "receta2",
      nombre: "Pollo a la Plancha",
      imagenUrl: "https://via.placeholder.com/60/FF5733?text=R2",
      calorias: 450,
      tiempoPreparacion: 25,
      macronutrientes: { proteinas: 40, carbohidratos: 5, grasas: 30 },
    },
    {
      id: "receta3",
      nombre: "Batido de Proteínas",
      imagenUrl: "https://via.placeholder.com/60/33FF57?text=R3",
      calorias: 200,
      tiempoPreparacion: 5,
      macronutrientes: { proteinas: 30, carbohidratos: 10, grasas: 5 },
    },
  ];
}

export async function getEntrenamientosCollection() {
  // Simula la obtención de datos de entrenamientos
  // En una app real: const querySnapshot = await getDocs(collection(db, "entrenamientos"));
  // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log("Obteniendo entrenamientos (simulado)...");
  return [
    {
      id: "entrenamiento1",
      nombre: "Cardio Intenso",
      duracion: 30,
      tipo: "cardio",
    },
    {
      id: "entrenamiento2",
      nombre: "Rutina Full Body",
      duracion: 45,
      tipo: "fuerza",
    },
    { id: "entrenamiento3", nombre: "Yoga Flow", duracion: 60, tipo: "yoga" },
  ];
}
