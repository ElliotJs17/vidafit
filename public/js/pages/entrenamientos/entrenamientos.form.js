// public/js/pages/entrenamientos/entrenamientos.form.js

import elements from "./entrenamientos.elements.js";
import { utils, showError } from "./entrenamientos.utils.js";

let imagenFile = null;
let imagenActual = null;

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
  addEjercicioField();
  addInstruccionField();
  elements.modalTitle.textContent = "✨ Crear Nuevo Entrenamiento";
}

export function closeModal() {
  toggleModal(false);
  resetForm();
}

export function closeDetallesModal() {
  toggleModal(false, "details");
}

export function resetForm() {
  if (elements.formEntrenamiento) {
    elements.formEntrenamiento.reset();
  }
  if (elements.ejerciciosContainer) {
    elements.ejerciciosContainer.innerHTML = "";
  }
  if (elements.instruccionesContainer) {
    elements.instruccionesContainer.innerHTML = "";
  }
  removeImage();
  imagenFile = null;
  imagenActual = null;
}

export function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.match("image.*")) {
    showError("Por favor, selecciona un archivo de imagen válido");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showError("La imagen no debe superar los 2MB");
    return;
  }

  imagenFile = file;

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
  if (elements.entrenamientoImagenInput) {
    elements.entrenamientoImagenInput.value = "";
  }
  utils.showElement(elements.imagenPreviewContainer, false);
}

export function addEjercicioField(nombre = "", series = "", repeticiones = "") {
  if (!elements.ejerciciosContainer) return;
  const ejercicioDiv = document.createElement("div");
  ejercicioDiv.className = "ejercicio-item";
  ejercicioDiv.innerHTML = `
    <div class="form-group">
      <label>Ejercicio</label>
      <input type="text" placeholder="Nombre del ejercicio" 
             class="ejercicio-nombre" value="${utils.sanitizeInput(
               nombre
             )}" required>
    </div>
    <div class="form-group">
      <label>Series</label>
      <input type="number" placeholder="0" 
             class="ejercicio-series" value="${series}" 
             min="1" required>
    </div>
    <div class="form-group">
      <label>Repeticiones</label>
      <input type="text" placeholder="10, 12-15, etc" 
             class="ejercicio-repeticiones" value="${utils.sanitizeInput(
               repeticiones
             )}" required>
    </div>
    <button type="button" class="btn-eliminar-item" title="Eliminar ejercicio">×</button>
  `;

  elements.ejerciciosContainer.appendChild(ejercicioDiv);

  ejercicioDiv
    .querySelector(".btn-eliminar-item")
    .addEventListener("click", () => {
      ejercicioDiv.remove();
    });
}

export function addInstruccionField(texto = "") {
  if (!elements.instruccionesContainer) return;
  const instruccionDiv = document.createElement("div");
  instruccionDiv.className = "instruccion-item";

  const instruccionNumber = elements.instruccionesContainer.children.length + 1;

  instruccionDiv.innerHTML = `
    <div class="instruccion-number">${instruccionNumber}</div>
    <input type="text" placeholder="Describe esta instrucción..." 
           class="instruccion-texto" value="${utils.sanitizeInput(
             texto
           )}" required>
    <button type="button" class="btn-eliminar-item" title="Eliminar instrucción">×</button>
  `;

  elements.instruccionesContainer.appendChild(instruccionDiv);

  instruccionDiv
    .querySelector(".btn-eliminar-item")
    .addEventListener("click", () => {
      instruccionDiv.remove();
      updateInstruccionNumbers();
    });
}

export function updateInstruccionNumbers() {
  if (!elements.instruccionesContainer) return;
  const instrucciones =
    elements.instruccionesContainer.querySelectorAll(".instruccion-item");
  instrucciones.forEach((instruccion, index) => {
    const instruccionNumberElement = instruccion.querySelector(
      ".instruccion-number"
    );
    if (instruccionNumberElement) {
      instruccionNumberElement.textContent = index + 1;
    }
  });
}

export function validateForm() {
  if (!elements.formEntrenamiento) throw new Error("Formulario no encontrado.");

  const ejerciciosItems = document.querySelectorAll(".ejercicio-item");
  if (ejerciciosItems.length === 0) {
    throw new Error("Debes agregar al menos un ejercicio");
  }

  const instruccionesItems = document.querySelectorAll(".instruccion-item");
  if (instruccionesItems.length === 0) {
    throw new Error("Debes agregar al menos una instrucción");
  }

  const nombre =
    elements.formEntrenamiento["entrenamiento-nombre"]?.value.trim();
  if (!nombre || nombre.length < 3) {
    throw new Error("El nombre debe tener al menos 3 caracteres");
  }

  const duracionInput = elements.formEntrenamiento["entrenamiento-duracion"];
  const duracion = duracionInput ? parseInt(duracionInput.value) : NaN;
  if (isNaN(duracion) || duracion <= 0) {
    throw new Error("La duración debe ser mayor a 0");
  }

  if (imagenFile && imagenFile.size > 2 * 1024 * 1024) {
    throw new Error("La imagen no debe superar los 2MB");
  }

  return true;
}

export function getFormData() {
  return {
    nombre: utils.sanitizeInput(
      elements.formEntrenamiento["entrenamiento-nombre"].value.trim()
    ),
    descripcion: utils.sanitizeInput(
      elements.formEntrenamiento["entrenamiento-desc"].value.trim()
    ),
    tipo: elements.formEntrenamiento["entrenamiento-tipo"].value,
    duracion: parseInt(
      elements.formEntrenamiento["entrenamiento-duracion"].value
    ),
    nivel: elements.formEntrenamiento["entrenamiento-nivel"].value,
    equipamiento: utils.sanitizeInput(
      elements.formEntrenamiento["entrenamiento-equipamiento"].value.trim()
    ),
    calorias: elements.formEntrenamiento["entrenamiento-calorias"].value
      ? parseInt(elements.formEntrenamiento["entrenamiento-calorias"].value)
      : null,
    objetivo: elements.formEntrenamiento["entrenamiento-objetivo"].value,
    ejercicios: Array.from(document.querySelectorAll(".ejercicio-item")).map(
      (item) => ({
        nombre: utils.sanitizeInput(
          item.querySelector(".ejercicio-nombre").value.trim()
        ),
        series: parseInt(item.querySelector(".ejercicio-series").value),
        repeticiones: utils.sanitizeInput(
          item.querySelector(".ejercicio-repeticiones").value.trim()
        ),
      })
    ),
    instrucciones: Array.from(
      document.querySelectorAll(".instruccion-item")
    ).map((item) =>
      utils.sanitizeInput(item.querySelector(".instruccion-texto").value.trim())
    ),
    keywords: elements.formEntrenamiento["entrenamiento-keywords"].value
      ? elements.formEntrenamiento["entrenamiento-keywords"].value
          .split(",")
          .map((k) => utils.sanitizeInput(k.trim()))
      : [],
    createdAt: new Date().toISOString(),
  };
}

export function fillForm(entrenamiento) {
  if (!elements.formEntrenamiento) return;

  elements.formEntrenamiento["entrenamiento-nombre"].value =
    entrenamiento.nombre || "";
  elements.formEntrenamiento["entrenamiento-desc"].value =
    entrenamiento.descripcion || "";
  elements.formEntrenamiento["entrenamiento-tipo"].value =
    entrenamiento.tipo || "";
  elements.formEntrenamiento["entrenamiento-duracion"].value =
    entrenamiento.duracion || "";
  elements.formEntrenamiento["entrenamiento-nivel"].value =
    entrenamiento.nivel || "";
  elements.formEntrenamiento["entrenamiento-equipamiento"].value =
    entrenamiento.equipamiento || "";
  elements.formEntrenamiento["entrenamiento-calorias"].value =
    entrenamiento.calorias || "";
  elements.formEntrenamiento["entrenamiento-objetivo"].value =
    entrenamiento.objetivo || "Pérdida de grasa";
  elements.formEntrenamiento["entrenamiento-keywords"].value =
    entrenamiento.keywords?.join(", ") || "";

  elements.ejerciciosContainer.innerHTML = "";
  elements.instruccionesContainer.innerHTML = "";

  entrenamiento.ejercicios?.forEach((ej) => {
    addEjercicioField(ej.nombre, ej.series, ej.repeticiones);
  });

  entrenamiento.instrucciones?.forEach((inst) => {
    addInstruccionField(inst);
  });

  imagenActual = entrenamiento.imagenUrl || null;
  if (imagenActual) {
    if (elements.previewImg) {
      elements.previewImg.src = imagenActual;
    }
    utils.showElement(elements.imagenPreviewContainer);
  } else {
    utils.showElement(elements.imagenPreviewContainer, false);
  }

  elements.modalTitle.textContent = "✏️ Editar Entrenamiento";
}
