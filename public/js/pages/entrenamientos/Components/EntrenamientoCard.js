// 📁 public/js/pages/entrenamientos/components/card.js
// ✅ Componente para crear tarjetas de entrenamiento
export class EntrenamientoCard {
  constructor(entrenamiento, isSelected = false, showSelection = true) {
    this.entrenamiento = entrenamiento;
    this.isSelected = isSelected;
    this.showSelection = showSelection;
  }

  // ✅ Crear elemento DOM de la tarjeta
  crear() {
    const card = document.createElement("div");
    card.className = "entrenamiento-card";
    card.dataset.tipo = this.entrenamiento.tipo || "general";

    if (this.isSelected) {
      card.classList.add("seleccionado");
    }

    card.innerHTML = `
      <div class="entrenamiento-header">
        ${this.showSelection ? `
          <div class="checkbox-container">
            <input type="checkbox" 
                   class="entrenamiento-checkbox" 
                   id="check-${this.entrenamiento.id}"
                   data-entrenamiento-id="${this.entrenamiento.id}"
                   ${this.isSelected ? 'checked' : ''}>
          </div>
        ` : ''}
        <div class="entrenamiento-info">
          <div class="entrenamiento-titulo">
            <h3>${this.entrenamiento.nombre}</h3>
          </div>
          ${this.entrenamiento.tipo ? `
            <div class="tipo-badge tipo-${this.entrenamiento.tipo}">${this.entrenamiento.tipo}</div>
          ` : ''}
          <div class="entrenamiento-descripcion">
            <p>${this.entrenamiento.descripcion}</p>
          </div>
          <div class="entrenamiento-stats">
            <div class="stats">
              <span class="stat-item">🔥 ${this.entrenamiento.calorias || 0} cal</span>
              <span class="stat-item">📊 ${this.entrenamiento.dificultad || 'N/A'}</span>
              <span class="stat-item">⏱️ ${this.entrenamiento.duracion || 0} min</span>
            </div>
          </div>
        </div>
      </div>`;

    return card;
  }
}