export default function initHomePage() {
  // Efecto hover para las tarjetas
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
}
