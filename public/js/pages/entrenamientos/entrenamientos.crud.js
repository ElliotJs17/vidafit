// public/js/pages/entrenamientos/entrenamientos.crud.js

import {
  getEntrenamientosCollection,
  uploadImageToStorage,
} from "./entrenamientos.firebase.js";
import {
  showError,
  showSuccess,
  utils,
  handleNetworkError,
} from "./entrenamientos.utils.js";
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
} from "./entrenamientos.form.js";
import {
  renderEntrenamientos,
  renderEntrenamientoDetails,
} from "./entrenamientos.render.js";
import elements from "./entrenamientos.elements.js";
import { loadEntrenamientos } from "./entrenamientos.js";

let entrenamientoActualId = null;

export function setEntrenamientoActualId(id) {
  entrenamientoActualId = id;
}

export function getEntrenamientoActualId() {
  return entrenamientoActualId;
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

    const entrenamientosCollection = getEntrenamientosCollection();
    let imagenUrl = getImagenActual();
    const imagenFile = getImagenFile();

    let tempEntrenamientoId = entrenamientoActualId || "temp";

    if (imagenFile) {
      imagenUrl = await uploadImageToStorage(tempEntrenamientoId, imagenFile);
    }

    const entrenamientoData = getFormData();
    entrenamientoData.imagenUrl = imagenUrl;

    if (entrenamientoActualId) {
      await setDoc(
        doc(entrenamientosCollection, entrenamientoActualId),
        entrenamientoData
      );
      showSuccess("Entrenamiento actualizado correctamente");
    } else {
      const docRef = await addDoc(entrenamientosCollection, entrenamientoData);
      setEntrenamientoActualId(docRef.id);

      if (imagenFile && imagenUrl && tempEntrenamientoId === "temp") {
        const nuevaImagenUrl = await uploadImageToStorage(
          docRef.id,
          imagenFile
        );
        if (nuevaImagenUrl) {
          await setDoc(
            doc(entrenamientosCollection, docRef.id),
            { imagenUrl: nuevaImagenUrl },
            { merge: true }
          );
        }
      } else if (!imagenUrl && imagenFile) {
        const nuevaImagenUrl = await uploadImageToStorage(
          docRef.id,
          imagenFile
        );
        if (nuevaImagenUrl) {
          await setDoc(
            doc(entrenamientosCollection, docRef.id),
            { imagenUrl: nuevaImagenUrl },
            { merge: true }
          );
        }
      }

      showSuccess("Entrenamiento creado correctamente");
    }

    toggleModal(false);
    resetForm();
    await loadEntrenamientos();
  } catch (error) {
    console.error("Error al guardar entrenamiento:", error);
    showError(error.message || "Error al guardar el entrenamiento");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
    setEntrenamientoActualId(null);
  }
}

export async function editarEntrenamiento(entrenamientoId) {
  try {
    const { doc, getDoc } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );
    const entrenamientosCollection = getEntrenamientosCollection();
    const entrenamientoDoc = await getDoc(
      doc(entrenamientosCollection, entrenamientoId)
    );

    if (!entrenamientoDoc.exists()) {
      throw new Error("Entrenamiento no encontrado");
    }

    const entrenamiento = entrenamientoDoc.data();
    setEntrenamientoActualId(entrenamientoId);

    closeDetallesModal();
    fillForm(entrenamiento);
    openModal();
  } catch (error) {
    console.error("Error al editar entrenamiento:", error);
    showError("Error al cargar los datos del entrenamiento");
  }
}

export async function eliminarEntrenamiento(entrenamientoId) {
  if (
    !confirm(
      "¿Estás seguro de que quieres eliminar este entrenamiento? Esta acción no se puede deshacer."
    )
  ) {
    return;
  }

  try {
    const { doc, deleteDoc } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );
    const entrenamientosCollection = getEntrenamientosCollection();

    await deleteDoc(doc(entrenamientosCollection, entrenamientoId));

    showSuccess("Entrenamiento eliminado correctamente");
    closeDetallesModal();
    await loadEntrenamientos();
  } catch (error) {
    console.error("Error al eliminar entrenamiento:", error);
    showError("Error al eliminar el entrenamiento");
  }
}

export async function showEntrenamientoDetails(entrenamientoId) {
  try {
    const { doc, getDoc } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
    );
    const entrenamientosCollection = getEntrenamientosCollection();

    const entrenamientoDoc = await getDoc(
      doc(entrenamientosCollection, entrenamientoId)
    );
    if (!entrenamientoDoc.exists()) {
      throw new Error("Entrenamiento no encontrado");
    }

    const entrenamiento = entrenamientoDoc.data();
    renderEntrenamientoDetails(entrenamiento, entrenamientoId);

    toggleModal(true, "details");
  } catch (error) {
    console.error("Error mostrando detalles:", error);
    showError("Error al cargar los detalles del entrenamiento");
  }
}
