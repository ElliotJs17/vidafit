// public/js/pages/recetas/recetas.form.js

import elements from "./recetas.elements.js";
import { utils, showError } from "./recetas.utils.js";

let imagenFile = null;
let imagenActual = null; // Para la URL de la imagen existente en edición

export function setImagenActual(url) {
  imagenActual = url;
}

export function setImagenFile(file) {
  imagenFile = file;
}

export function getImagenFile() {
  return imagenFile;
}

export function getImagenActual() {
  return imagenActual;
}

export function toggleModal(show, modalType = "form") {
  const modal = modalType === "form" ? elements.modal : elements.modalDetalles;
  if (modal) {
    modal.style.display = show ? "block" : "none";
  }
  document.body.style.overflow = show ? "hidden" : "auto";
}

export function openModal() {
  toggleModal(true);
  resetForm();
  addIngredienteField();
  addPasoField();
  elements.modalTitle.textContent = "✨ Crear Nueva Receta";
}

export function closeModal() {
  toggleModal(false);
  resetForm();
  // No resetear recetaActualId aquí, se hace en el CRUD al guardar o editar.
}

export function closeDetallesModal() {
  toggleModal(false, "details");
}

export function resetForm() {
  if (elements.formReceta) {
    elements.formReceta.reset();
  }
  if (elements.ingredientesContainer) {
    elements.ingredientesContainer.innerHTML = "";
  }
  if (elements.pasosContainer) {
    elements.pasosContainer.innerHTML = "";
  }
  removeImage();
  imagenFile = null;
  imagenActual = null;
}

export function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tipo de archivo
  if (!file.type.match("image.*")) {
    showError("Por favor, selecciona un archivo de imagen válido");
    return;
  }

  // Validar tamaño (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showError("La imagen no debe superar los 2MB");
    return;
  }

  imagenFile = file;

  // Mostrar vista previa
  const reader = new FileReader();
  reader.onload = function (e) {
    if (elements.previewImg) {
      elements.previewImg.src = e.target.result;
      utils.showElement(elements.imagenPreviewContainer);
    }
  };
  reader.readAsDataURL(file);
}

export function removeImage() {
  imagenFile = null;
  imagenActual = null;
  if (elements.recetaImagenInput) {
    elements.recetaImagenInput.value = "";
  }
  utils.showElement(elements.imagenPreviewContainer, false);
}

export function addIngredienteField(nombre = "", cantidad = "", unidad = "") {
  if (!elements.ingredientesContainer) return;
  const ingredienteDiv = document.createElement("div");
  ingredienteDiv.className = "ingrediente-item";
  ingredienteDiv.innerHTML = `
    <div class="form-group">
      <label>Ingrediente</label>
      <input type="text" placeholder="Nombre del ingrediente" 
             class="ingrediente-nombre" value="${utils.sanitizeInput(
               nombre
             )}" required>
    </div>
    <div class="form-group">
      <label>Cantidad</label>
      <input type="number" placeholder="0" 
             class="ingrediente-cantidad" value="${cantidad}" 
             min="0" step="0.1" required>
    </div>
    <div class="form-group">
      <label>Unidad</label>
      <input type="text" placeholder="g, ml, etc" 
             class="ingrediente-unidad" value="${utils.sanitizeInput(
               unidad
             )}" required>
    </div>
    <button type="button" class="btn-eliminar-item" title="Eliminar ingrediente">×</button>
  `;

  elements.ingredientesContainer.appendChild(ingredienteDiv);

  ingredienteDiv
    .querySelector(".btn-eliminar-item")
    .addEventListener("click", () => {
      ingredienteDiv.remove();
    });
}

export function addPasoField(texto = "") {
  if (!elements.pasosContainer) return;
  const pasoDiv = document.createElement("div");
  pasoDiv.className = "paso-item";

  const pasoNumber = elements.pasosContainer.children.length + 1;

  pasoDiv.innerHTML = `
    <div class="paso-number">${pasoNumber}</div>
    <input type="text" placeholder="Describe este paso de preparación..." 
           class="paso-texto" value="${utils.sanitizeInput(texto)}" required>
    <button type="button" class="btn-eliminar-item" title="Eliminar paso">×</button>
  `;

  elements.pasosContainer.appendChild(pasoDiv);

  pasoDiv.querySelector(".btn-eliminar-item").addEventListener("click", () => {
    pasoDiv.remove();
    updatePasoNumbers();
  });
}

export function updatePasoNumbers() {
  if (!elements.pasosContainer) return;
  const pasos = elements.pasosContainer.querySelectorAll(".paso-item");
  pasos.forEach((paso, index) => {
    const pasoNumberElement = paso.querySelector(".paso-number");
    if (pasoNumberElement) {
      pasoNumberElement.textContent = index + 1;
    }
  });
}

export function validateForm() {
  if (!elements.formReceta) throw new Error("Formulario no encontrado.");

  const ingredientesItems = document.querySelectorAll(".ingrediente-item");
  if (ingredientesItems.length === 0) {
    throw new Error("Debes agregar al menos un ingrediente");
  }

  const pasosItems = document.querySelectorAll(".paso-item");
  if (pasosItems.length === 0) {
    throw new Error("Debes agregar al menos un paso de preparación");
  }

  const nombre = elements.formReceta["receta-nombre"]?.value.trim();
  if (!nombre || nombre.length < 3) {
    throw new Error("El nombre debe tener al menos 3 caracteres");
  }

  const tiempoInput = elements.formReceta["receta-tiempo"];
  const tiempo = tiempoInput ? parseInt(tiempoInput.value) : NaN;
  if (isNaN(tiempo) || tiempo <= 0) {
    throw new Error("El tiempo de preparación debe ser mayor a 0");
  }

  const proteinasInput = elements.formReceta["receta-proteinas"];
  const carbsInput = elements.formReceta["receta-carbs"];
  const grasasInput = elements.formReceta["receta-grasas"];

  const proteinas = proteinasInput ? parseFloat(proteinasInput.value) : NaN;
  const carbs = carbsInput ? parseFloat(carbsInput.value) : NaN;
  const grasas = grasasInput ? parseFloat(grasasInput.value) : NaN;

  if (isNaN(proteinas) || isNaN(carbs) || isNaN(grasas)) {
    throw new Error("Todos los macronutrientes son obligatorios");
  }

  // Validar tamaño de imagen si se subió una
  if (imagenFile && imagenFile.size > 2 * 1024 * 1024) {
    throw new Error("La imagen no debe superar los 2MB");
  }

  return true;
}

export function getFormData() {
  return {
    nombre: utils.sanitizeInput(
      elements.formReceta["receta-nombre"].value.trim()
    ),
    descripcion: utils.sanitizeInput(
      elements.formReceta["receta-desc"].value.trim()
    ),
    categoria: elements.formReceta["receta-categoria"].value,
    macronutrientes: {
      proteinas: parseFloat(elements.formReceta["receta-proteinas"].value),
      carbohidratos: parseFloat(elements.formReceta["receta-carbs"].value),
      grasas: parseFloat(elements.formReceta["receta-grasas"].value),
    },
    tiempoPreparacion: parseInt(elements.formReceta["receta-tiempo"].value),
    dificultad: elements.formReceta["receta-dificultad"].value,
    calorias: parseInt(elements.formReceta["receta-calorias"].value),
    objetivo: elements.formReceta["receta-objetivo"].value,
    ingredientes: Array.from(
      document.querySelectorAll(".ingrediente-item")
    ).map((item) => ({
      nombre: utils.sanitizeInput(
        item.querySelector(".ingrediente-nombre").value.trim()
      ),
      cantidad: parseFloat(item.querySelector(".ingrediente-cantidad").value),
      unidad: utils.sanitizeInput(
        item.querySelector(".ingrediente-unidad").value.trim()
      ),
    })),
    pasos: Array.from(document.querySelectorAll(".paso-item")).map((item) =>
      utils.sanitizeInput(item.querySelector(".paso-texto").value.trim())
    ),
    keywords: elements.formReceta["receta-keywords"].value
      ? elements.formReceta["receta-keywords"].value
          .split(",")
          .map((k) => utils.sanitizeInput(k.trim()))
      : [],
    createdAt: new Date().toISOString(), // Se añade o se mantiene al crear/actualizar
  };
}

export function fillForm(receta) {
  if (!elements.formReceta) return;

  elements.formReceta["receta-nombre"].value = receta.nombre || "";
  elements.formReceta["receta-desc"].value = receta.descripcion || "";
  elements.formReceta["receta-categoria"].value = receta.categoria || "";
  elements.formReceta["receta-tiempo"].value = receta.tiempoPreparacion || "";
  elements.formReceta["receta-dificultad"].value = receta.dificultad || "";
  elements.formReceta["receta-calorias"].value = receta.calorias || "";
  elements.formReceta["receta-objetivo"].value = receta.objetivo || "Energía";
  elements.formReceta["receta-proteinas"].value =
    receta.macronutrientes?.proteinas || "";
  elements.formReceta["receta-carbs"].value =
    receta.macronutrientes?.carbohidratos || "";
  elements.formReceta["receta-grasas"].value =
    receta.macronutrientes?.grasas || "";
  elements.formReceta["receta-keywords"].value =
    receta.keywords?.join(", ") || "";

  elements.ingredientesContainer.innerHTML = "";
  elements.pasosContainer.innerHTML = "";

  receta.ingredientes?.forEach((ing) => {
    addIngredienteField(ing.nombre, ing.cantidad, ing.unidad);
  });

  receta.pasos?.forEach((paso) => {
    addPasoField(paso);
  });

  // Cargar imagen existente
  imagenActual = receta.imagenUrl || null;
  if (imagenActual) {
    if (elements.previewImg) {
      elements.previewImg.src = imagenActual;
    }
    utils.showElement(elements.imagenPreviewContainer);
  } else {
    utils.showElement(elements.imagenPreviewContainer, false);
  }

  elements.modalTitle.textContent = "✏️ Editar Receta";
}
