import { FIRESTORE_CONFIG } from "./mi-plan.constants.js";

let db;
let miPlanCollection;
let recetasCollection;
let entrenamientosCollection;
let doc, setDoc, getDoc, query, where, getDocs, collection, getFirestore;

export async function initFirestore() {
  if (db) return true;

  try {
    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"
    );
    const {
      getFirestore: getFirestoreFn,
      collection: collectionFn,
      doc: docFn,
      setDoc: setDocFn,
      getDoc: getDocFn,
      query: queryFn,
      where: whereFn,
      getDocs: getDocsFn,
    } = await import(
      "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"
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
    db = getFirestoreFn(app);

    // Asignar funciones
    getFirestore = getFirestoreFn;
    collection = collectionFn;
    doc = docFn;
    setDoc = setDocFn;
    getDoc = getDocFn;
    query = queryFn;
    where = whereFn;
    getDocs = getDocsFn;

    // Inicializar colecciones
    miPlanCollection = collection(db, FIRESTORE_CONFIG.collectionName);
    recetasCollection = collection(db, "recetas");
    entrenamientosCollection = collection(db, "entrenamientos");

    return true;
  } catch (error) {
    console.error("Error inicializando Firebase:", error);
    return false;
  }
}

export function getMiPlanCollection() {
  return miPlanCollection;
}

export async function getPlanByWeekId(planId) {
  try {
    if (!db) await initFirestore();
    const planRef = doc(miPlanCollection, planId);
    const planSnap = await getDoc(planRef);
    return planSnap.exists() ? planSnap.data() : null;
  } catch (error) {
    console.error("Error obteniendo plan:", error);
    throw error;
  }
}

export async function savePlan(plan) {
  try {
    if (!db) await initFirestore();
    const planRef = doc(miPlanCollection, plan.id);
    await setDoc(planRef, plan, { merge: true });
    console.log("Plan guardado:", plan.id);
    return true;
  } catch (error) {
    console.error("Error guardando plan:", error);
    throw error;
  }
}

export async function getRecetasCollection() {
  try {
    if (!db) await initFirestore();
    const querySnapshot = await getDocs(recetasCollection);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error obteniendo recetas:", error);
    return [];
  }
}

export async function getEntrenamientosCollection() {
  try {
    if (!db) await initFirestore();
    const querySnapshot = await getDocs(entrenamientosCollection);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error obteniendo entrenamientos:", error);
    return [];
  }
}
