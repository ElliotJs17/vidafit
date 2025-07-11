// Días de la semana
export const DIAS_SEMANA = [
  { id: "lunes", nombre: "Lunes" },
  { id: "martes", nombre: "Martes" },
  { id: "miercoles", nombre: "Miércoles" },
  { id: "jueves", nombre: "Jueves" },
  { id: "viernes", nombre: "Viernes" },
  { id: "sabado", nombre: "Sábado" },
  { id: "domingo", nombre: "Domingo" },
];

// Tipos de comidas
export const TIPOS_COMIDA = [
  { id: "desayuno", nombre: "Desayuno" },
  { id: "almuerzo", nombre: "Almuerzo" },
  { id: "cena", nombre: "Cena" },
  { id: "snack", nombre: "Snack" },
];

// Tipos de entrenamiento
export const TIPOS_ENTRENAMIENTO = [
  { id: "cardio", nombre: "Cardio" },
  { id: "fuerza", nombre: "Fuerza" },
  { id: "hiit", nombre: "HIIT" },
  { id: "yoga", nombre: "Yoga" },
];

// Configuración de Firestore
export const FIRESTORE_CONFIG = {
  collectionName: "mi-plan",
};

// Objetivos de fitness
export const FITNESS_GOALS = {
  "weight-loss": "Pérdida de peso",
  "muscle-gain": "Ganancia muscular",
  "improve-endurance": "Mejorar resistencia",
  "improve-flexibility": "Mejorar flexibilidad",
};

// Niveles de actividad
export const ACTIVITY_LEVELS = {
  sedentary: "Sedentario",
  light: "Ligero",
  moderate: "Moderado",
  active: "Activo",
  veryActive: "Muy activo",
};
