import ProfileService from "../../services/profile.service.js";
import AuthService from "../../auth/auth.service.js";
import perfilForm from "./perfil-form.js";
import perfilAvatar from "./perfil-avatar.js";

export default function () {
  // Inicializar módulos
  const formModule = perfilForm();
  const avatarModule = perfilAvatar();

  // Cargar datos del perfil
  const loadProfileData = async () => {
    try {
      const user = await AuthService.checkAuthState();
      if (!user) return;

      const profile = await ProfileService.getUserProfile(user.uid);

      // Actualizar UI con datos del perfil
      if (profile) {
        formModule.setFormData(profile);
        if (profile.avatarUrl) {
          avatarModule.setAvatar(profile.avatarUrl);
        }
        updateProfileStats(profile);
      }

      // Mostrar email del usuario (de auth)
      document.getElementById("profile-email").textContent = user.email;
      document.getElementById("profile-display-name").textContent =
        profile?.displayName || user.displayName || "Usuario";
      document.getElementById("profile-email").textContent = user.email;
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  // Calcular y mostrar estadísticas
  const updateProfileStats = (profile) => {
    if (profile.birthdate) {
      const age = calculateAge(profile.birthdate);
      document.getElementById("profile-age").textContent = age;
    }

    if (profile.height) {
      document.getElementById("profile-height").textContent = profile.height;
    }

    if (profile.weight) {
      document.getElementById("profile-weight").textContent = profile.weight;
    }

    if (profile.height && profile.weight) {
      const bmi = calculateBMI(profile.weight, profile.height);
      document.getElementById("profile-bmi").textContent = bmi.toFixed(1);
    }
  };

  // Calcular edad a partir de la fecha de nacimiento
  const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Calcular IMC
  const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  loadProfileData();

  return {
    cleanup: () => {
      formModule.cleanup();
      avatarModule.cleanup();
    },
  };
}
