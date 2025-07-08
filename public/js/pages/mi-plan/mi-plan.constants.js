// Días de la semana y tipos de comidas
export const DIAS_SEMANA = [
  { id: "lunes", nombre: "Lunes" },
  { id: "martes", nombre: "Martes" },
  { id: "miercoles", nombre: "Miércoles" },
  { id: "jueves", nombre: "Jueves" },
  { id: "viernes", nombre: "Viernes" },
  { id: "sabado", nombre: "Sábado" },
  { id: "domingo", nombre: "Domingo" },
];

export const TIPOS_COMIDA = [
  { id: "desayuno", nombre: "Desayuno" },
  { id: "almuerzo", nombre: "Almuerzo" },
  { id: "cena", nombre: "Cena" },
  { id: "snack", nombre: "Snack" },
];

export const TIPOS_ENTRENAMIENTO = [
  { id: "cardio", nombre: "Cardio" },
  { id: "fuerza", nombre: "Fuerza" },
  { id: "hiit", nombre: "HIIT" },
  { id: "yoga", nombre: "Yoga" },
];

// Configuración de Firebase
export const FIRESTORE_CONFIG = {
  collectionName: "mi-plan",
};
