import ProfileService from "../../services/profile.service.js";
import AuthService from "../../auth/auth.service.js";

export default function () {
  const avatarUpload = document.getElementById("avatar-upload");
  const avatarPreview = document.getElementById("avatar-preview");
  const avatarImage = document.getElementById("avatar-image");
  const changeAvatarBtn = document.getElementById("change-avatar-btn");

  const setAvatar = (url) => {
    avatarImage.src = url;

    // Actualizar también en el header si existe
    const headerAvatar = document.getElementById("header-avatar");
    if (headerAvatar) {
      headerAvatar.src = url;
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo y tamaño de archivo
    if (!file.type.match("image.*")) {
      alert("Por favor, selecciona un archivo de imagen válido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      alert("La imagen es demasiado grande. El tamaño máximo es 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      avatarImage.src = event.target.result;

      // Mostrar mini preview en el header si existe
      const headerAvatar = document.getElementById("header-avatar");
      if (headerAvatar) {
        headerAvatar.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);

    uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    try {
      const user = await AuthService.checkAuthState();
      if (!user) return;

      // Mostrar loader
      changeAvatarBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
      changeAvatarBtn.disabled = true;

      const avatarUrl = await ProfileService.uploadAvatar(user.uid, file);
      await ProfileService.updateUserProfile(user.uid, {
        avatarUrl,
        lastUpdated: new Date().toISOString(),
      });

      // Restaurar botón
      changeAvatarBtn.innerHTML = '<i class="fas fa-upload"></i> Cambiar Foto';
      changeAvatarBtn.disabled = false;

      // Mostrar notificación de éxito
      showNotification("Foto de perfil actualizada correctamente", "success");
    } catch (error) {
      console.error("Error uploading avatar:", error);

      // Restaurar botón
      changeAvatarBtn.innerHTML = '<i class="fas fa-upload"></i> Cambiar Foto';
      changeAvatarBtn.disabled = false;

      showNotification("Error al actualizar la foto de perfil", "error");
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  changeAvatarBtn.addEventListener("click", () => avatarUpload.click());
  avatarUpload.addEventListener("change", handleAvatarChange);

  return {
    cleanup: () => {
      changeAvatarBtn.removeEventListener("click", () => avatarUpload.click());
      avatarUpload.removeEventListener("change", handleAvatarChange);
    },
    setAvatar,
  };
}
