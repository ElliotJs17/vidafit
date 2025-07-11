// public/js/pages/home/home.js
export default function initHomePage() {
  // Efecto hover para tarjetas
  const featureCards = document.querySelectorAll(".feature-card");
  featureCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "scale(1.03)";
      card.style.transition = "transform 0.2s ease-out";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "scale(1)";
    });
  });

  // Cargar lógicamente las funciones del chatbot
  import("./chatbot.js"); // Esto solo las carga una vez
}
