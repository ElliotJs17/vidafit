import ProfileService from "../../services/profile.service.js";
import AuthService from "../../auth/auth.service.js";

export default function () {
  const form = document.getElementById("profile-form");
  const editBtn = document.getElementById("edit-btn");
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");

  // Objeto para guardar los datos originales
  let originalData = {};

  // Función para establecer el estado de edición del formulario
  const setFormEditable = (editable) => {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.disabled = !editable;
    });

    saveBtn.disabled = !editable;
    cancelBtn.style.display = editable ? "block" : "none";
    editBtn.style.display = editable ? "none" : "block";
  };

  // Función para cargar datos en el formulario
  const setFormData = (profileData) => {
    // Guardar copia de los datos originales
    originalData = { ...profileData };

    // Establecer valores en los campos del formulario
    document.getElementById("display-name").value =
      profileData.displayName || "";
    document.getElementById("first-name").value = profileData.firstName || "";
    document.getElementById("last-name").value = profileData.lastName || "";
    document.getElementById("gender").value = profileData.gender || "";
    document.getElementById("birthdate").value = profileData.birthdate || "";
    document.getElementById("phone").value = profileData.phone || "";
    document.getElementById("height").value = profileData.height || "";
    document.getElementById("weight").value = profileData.weight || "";
    document.getElementById("waist").value = profileData.waist || "";
    document.getElementById("hip").value = profileData.hip || "";
    document.getElementById("activity-level").value =
      profileData.activityLevel || "";
    document.getElementById("fitness-goal").value =
      profileData.fitnessGoal || "";
    document.getElementById("medical-conditions").value =
      profileData.medicalConditions || "";
    document.getElementById("allergies").value = profileData.allergies || "";

    // Establecer formulario en modo lectura
    setFormEditable(false);
  };

  // Función para manejar el clic en Editar
  const handleEdit = () => {
    setFormEditable(true);
  };

  // Función para manejar el clic en Cancelar
  const handleCancel = () => {
    // Restaurar valores originales
    document.getElementById("display-name").value =
      originalData.displayName || "";
    document.getElementById("first-name").value = originalData.firstName || "";
    document.getElementById("last-name").value = originalData.lastName || "";
    document.getElementById("gender").value = originalData.gender || "";
    document.getElementById("birthdate").value = originalData.birthdate || "";
    document.getElementById("phone").value = originalData.phone || "";
    document.getElementById("height").value = originalData.height || "";
    document.getElementById("weight").value = originalData.weight || "";
    document.getElementById("waist").value = originalData.waist || "";
    document.getElementById("hip").value = originalData.hip || "";
    document.getElementById("activity-level").value =
      originalData.activityLevel || "";
    document.getElementById("fitness-goal").value =
      originalData.fitnessGoal || "";
    document.getElementById("medical-conditions").value =
      originalData.medicalConditions || "";
    document.getElementById("allergies").value = originalData.allergies || "";

    // Volver a modo lectura
    setFormEditable(false);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await AuthService.checkAuthState();
      if (!user) return;

      // Obtener datos del formulario
      const profileData = {
        displayName: document.getElementById("display-name").value,
        firstName: document.getElementById("first-name").value,
        lastName: document.getElementById("last-name").value,
        gender: document.getElementById("gender").value,
        birthdate: document.getElementById("birthdate").value,
        phone: document.getElementById("phone").value,
        height: parseFloat(document.getElementById("height").value) || null,
        weight: parseFloat(document.getElementById("weight").value) || null,
        waist: parseFloat(document.getElementById("waist").value) || null,
        hip: parseFloat(document.getElementById("hip").value) || null,
        activityLevel: document.getElementById("activity-level").value,
        fitnessGoal: document.getElementById("fitness-goal").value,
        medicalConditions: document.getElementById("medical-conditions").value,
        allergies: document.getElementById("allergies").value,
        lastUpdated: new Date().toISOString(),
      };

      // Actualizar perfil en la base de datos
      await ProfileService.updateUserProfile(user.uid, profileData);

      // Actualizar datos originales
      originalData = { ...profileData };

      // Actualizar nombre en el header
      const headerName = document.querySelector(".username");
      if (headerName) {
        headerName.textContent = profileData.displayName;
      }

      // Actualizar estadísticas
      document.getElementById("profile-display-name").textContent =
        profileData.displayName;
      updateProfileStats(profileData);

      // Volver a modo lectura
      setFormEditable(false);

      alert("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al actualizar el perfil");
    }
  };

  // Función auxiliar para actualizar estadísticas (simulada)
  const updateProfileStats = (profileData) => {
    // Esta función debería estar implementada en perfil.js
    console.log("Actualizando estadísticas del perfil", profileData);
  };

  // Agregar event listeners
  editBtn.addEventListener("click", handleEdit);
  cancelBtn.addEventListener("click", handleCancel);
  form.addEventListener("submit", handleSubmit);

  // Retornar métodos públicos
  return {
    cleanup: () => {
      editBtn.removeEventListener("click", handleEdit);
      cancelBtn.removeEventListener("click", handleCancel);
      form.removeEventListener("submit", handleSubmit);
    },
    setFormData,
  };
}
