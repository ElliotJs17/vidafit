// public/js/pages/recetas/recetas.crud.js

import {
  getRecetasCollection,
  uploadImageToStorage,
} from "./recetas.firebase.js";
import {
  showError,
  showSuccess,
  utils,
  handleNetworkError,
} from "./recetas.utils.js";
import {
  toggleModal,
  closeDetallesModal,
  getImagenFile,
  getImagenActual,
  setImagenActual,
  setImagenFile,
  validateForm,
  getFormData,
  fillForm,
  resetForm,
  openModal,
} from "./recetas.form.js";
import { renderRecetas, renderRecetaDetails } from "./recetas.render.js";
import elements from "./recetas.elements.js";
import { loadRecetas } from "./recetas.js"; // Importar loadRecetas del archivo principal

let recetaActualId = null;

export function setRecetaActualId(id) {
  recetaActualId = id;
}

export function getRecetaActualId() {
  return recetaActualId;
}

export async function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = e.target.querySelector(".btn-save");
  const originalText = submitBtn.innerHTML;

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner" style="width: 16px; height: 16px; margin-right: 8px;"></span>
        Guardando...
      `;
    }

    validateForm();

    const { addDoc, doc, setDoc } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );

    const recetasCollection = getRecetasCollection();
    let imagenUrl = getImagenActual();
    const imagenFile = getImagenFile();

    let tempRecetaId = recetaActualId || "temp"; // Usar un ID temporal para la primera subida si es nueva

    // Subir imagen si hay una nueva o si es una creación y no hay un ID real aún
    if (imagenFile) {
      imagenUrl = await uploadImageToStorage(tempRecetaId, imagenFile);
    }

    const recetaData = getFormData();
    recetaData.imagenUrl = imagenUrl; // Actualizar la URL de la imagen en los datos

    if (recetaActualId) {
      // Actualizar receta existente
      await setDoc(doc(recetasCollection, recetaActualId), recetaData);
      showSuccess("Receta actualizada correctamente");
    } else {
      // Crear nueva receta
      const docRef = await addDoc(recetasCollection, recetaData);
      setRecetaActualId(docRef.id); // Guardar el ID de la nueva receta

      // Si se subió una imagen con ID temporal, actualizar con el ID real
      if (imagenFile && imagenUrl && tempRecetaId === "temp") {
        // La URL de la imagen se generó con el ID temporal, ahora actualizarla con el ID real
        const nuevaImagenUrl = await uploadImageToStorage(
          docRef.id,
          imagenFile
        );
        if (nuevaImagenUrl) {
          await setDoc(
            doc(recetasCollection, docRef.id),
            {
              imagenUrl: nuevaImagenUrl,
            },
            { merge: true }
          );
        }
      } else if (!imagenUrl && imagenFile) {
        // Si no se pudo subir la imagen con el ID temporal, intenta con el ID real si es nueva
        const nuevaImagenUrl = await uploadImageToStorage(
          docRef.id,
          imagenFile
        );
        if (nuevaImagenUrl) {
          await setDoc(
            doc(recetasCollection, docRef.id),
            {
              imagenUrl: nuevaImagenUrl,
            },
            { merge: true }
          );
        }
      }

      showSuccess("Receta creada correctamente");
    }

    toggleModal(false); // Cerrar modal al finalizar
    resetForm();
    await loadRecetas(); // Recargar todas las recetas
  } catch (error) {
    console.error("Error al guardar receta:", error);
    showError(error.message || "Error al guardar la receta");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
    setRecetaActualId(null); // Limpiar ID actual después de la operación
  }
}

export async function editarReceta(recetaId) {
  try {
    const { doc, getDoc } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );
    const recetasCollection = getRecetasCollection();
    const recetaDoc = await getDoc(doc(recetasCollection, recetaId));

    if (!recetaDoc.exists()) {
      throw new Error("Receta no encontrada");
    }

    const receta = recetaDoc.data();
    setRecetaActualId(recetaId); // Establecer la receta actual para edición

    closeDetallesModal(); // Cerrar el modal de detalles si está abierto

    fillForm(receta); // Rellenar el formulario con los datos de la receta
    openModal(); // Abrir el modal de formulario
  } catch (error) {
    console.error("Error al editar receta:", error);
    showError("Error al cargar los datos de la receta");
  }
}

export async function eliminarReceta(recetaId) {
  if (
    !confirm(
      "¿Estás seguro de que quieres eliminar esta receta? Esta acción no se puede deshacer."
    )
  ) {
    return;
  }

  try {
    const { doc, deleteDoc } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );
    const recetasCollection = getRecetasCollection();

    await deleteDoc(doc(recetasCollection, recetaId));

    showSuccess("Receta eliminada correctamente");
    closeDetallesModal();
    await loadRecetas(); // Recargar todas las recetas
  } catch (error) {
    console.error("Error al eliminar receta:", error);
    showError("Error al eliminar la receta");
  }
}

export async function showRecetaDetails(recetaId) {
  try {
    const { doc, getDoc } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );
    const recetasCollection = getRecetasCollection();

    const recetaDoc = await getDoc(doc(recetasCollection, recetaId));
    if (!recetaDoc.exists()) {
      throw new Error("Receta no encontrada");
    }

    const receta = recetaDoc.data();
    renderRecetaDetails(receta, recetaId); // Renderizar los detalles en el modal

    toggleModal(true, "details"); // Abrir el modal de detalles
  } catch (error) {
    console.error("Error mostrando detalles:", error);
    showError("Error al cargar los detalles de la receta");
  }
}
