// public/js/pages/recetas/recetas.render.js

import { utils } from "./recetas.utils.js";
import elements from "./recetas.elements.js";
import {
  showRecetaDetails,
  editarReceta,
  eliminarReceta,
} from "./recetas.crud.js"; // Importa funciones para los botones

export function renderRecetaCard(receta) {
  const keywords = receta.keywords || [];
  const tagsHtml = keywords
    .slice(0, 3)
    .map((tag) => `<span class="tag">${utils.sanitizeInput(tag)}</span>`)
    .join("");

  const imagenHtml = receta.imagenUrl
    ? `<div class="receta-imagen" style="background-image: url('${receta.imagenUrl}');"></div>`
    : '<div class="receta-imagen placeholder">🍳</div>';

  return `
    <div class="receta-card" data-id="${receta.id}">     
      <div class="receta-header">        
      ${imagenHtml}
        <span class="categoria-badge">
          ${utils.getCategoryEmoji(receta.categoria)} ${receta.categoria}
        </span>
      </div>
      <div class="receta-body">
        <h3 class="receta-title">${utils.sanitizeInput(receta.nombre)}</h3>
        <div class="receta-meta">
          <span class="meta-item">
            <span>⏱️</span> ${utils.formatTime(receta.tiempoPreparacion)}
          </span>
          <span class="meta-item">
            <span>${utils.getDifficultyStars(receta.dificultad)}</span> 
            ${receta.dificultad}
          </span>
          <span class="meta-item">
            <span>🔥</span> ${receta.calorias || "N/A"} cal
          </span>
        </div>
        <p class="receta-desc">${utils.truncateText(
          utils.sanitizeInput(receta.descripcion)
        )}</p>
        ${tagsHtml ? `<div class="receta-tags">${tagsHtml}</div>` : ""}
        <button class="btn-detalles" data-id="${receta.id}">
          Ver Detalles
        </button>
      </div>
    </div>
  `;
}

export function renderRecetas(recetasFiltradas, todasLasRecetas) {
  if (!elements.recetasGrid) return;

  if (recetasFiltradas.length === 0) {
    if (todasLasRecetas.length === 0) {
      utils.showEmpty(elements);
    } else {
      utils.showNoResults(elements);
    }
    elements.recetasGrid.innerHTML = "";
    return;
  }

  utils.showResults(elements, recetasFiltradas.length);
  elements.recetasGrid.innerHTML = recetasFiltradas
    .map(renderRecetaCard)
    .join("");

  // Delegación de eventos para mejor performance
  // Eliminar listener previo si existe para evitar duplicados
  const oldRecetasGrid = elements.recetasGrid;
  const newRecetasGrid = oldRecetasGrid.cloneNode(true);
  oldRecetasGrid.parentNode.replaceChild(newRecetasGrid, oldRecetasGrid);
  elements.recetasGrid = newRecetasGrid; // Actualizar la referencia en elements

  elements.recetasGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".receta-card");
    const detailsBtn = e.target.closest(".btn-detalles");

    if (card && !detailsBtn) {
      const recetaId = card.dataset.id;
      showRecetaDetails(recetaId);
    }

    if (detailsBtn) {
      e.stopPropagation();
      const recetaId = detailsBtn.dataset.id;
      showRecetaDetails(recetaId);
    }
  });
}

export function renderRecetaDetails(receta, recetaId) {
  elements.detalleTitulo.textContent = receta.nombre;

  // Construir HTML de manera segura
  const ingredientesHtml =
    receta.ingredientes
      ?.map(
        (ing) => `
        <li>
          <span class="ingrediente-cantidad">${
            ing.cantidad
          } ${utils.sanitizeInput(ing.unidad)}</span>
          <span class="ingrediente-nombre">${utils.sanitizeInput(
            ing.nombre
          )}</span>
        </li>
      `
      )
      ?.join("") || "";

  const pasosHtml =
    receta.pasos
      ?.map(
        (paso, index) => `
        <li>
          <span class="paso-numero">${index + 1}.</span>
          <span class="paso-texto">${utils.sanitizeInput(paso)}</span>
        </li>
      `
      )
      ?.join("") || "";

  const tagsHtml =
    receta.keywords
      ?.map((tag) => `<span class="tag">${utils.sanitizeInput(tag)}</span>`)
      ?.join("") || "";

  const imagenHtml = receta.imagenUrl
    ? `<div class="receta-detalle-imagen"><img src="${
        receta.imagenUrl
      }" alt="${utils.sanitizeInput(
        receta.nombre
      )}" style="max-width: 100%; max-height: 300px; object-fit: contain;"></div>`
    : "";

  elements.detalleContenido.innerHTML = `
      ${imagenHtml}
      <div class="receta-detalle-header">
        <h3>${utils.sanitizeInput(receta.nombre)}</h3>
        <div class="receta-meta">
          <span class="meta-item">
            <span>${utils.getCategoryEmoji(receta.categoria)}</span> ${
    receta.categoria
  }
          </span>
          <span class="meta-item">
            <span>⏱️</span> ${utils.formatTime(receta.tiempoPreparacion)}
          </span>
          <span class="meta-item">
            <span>${utils.getDifficultyStars(receta.dificultad)}</span> ${
    receta.dificultad
  }
          </span>
          <span class="meta-item">
            <span>🔥</span> ${receta.calorias || "N/A"} calorías
          </span>
        </div>
        ${tagsHtml ? `<div class="receta-tags">${tagsHtml}</div>` : ""}
      </div>

      <div class="receta-detalle-body">
        ${
          receta.descripcion
            ? `
          <div class="receta-desc">
            <h4>Descripción</h4>
            <p>${utils.sanitizeInput(receta.descripcion)}</p>
          </div>
        `
            : ""
        }

        <div class="receta-section ingredientes-section">
          <h4>Ingredientes</h4>
          <ul class="ingredientes-list">${ingredientesHtml}</ul>
        </div>

        <div class="receta-section pasos-section">
          <h4>Preparación</h4>
          <ol class="pasos-list">${pasosHtml}</ol>
        </div>

        <div class="receta-section nutricion-section">
          <h4>Información Nutricional</h4>
          <div class="nutricion-grid">
            <div class="nutricion-item">
              <span class="nutricion-valor">${receta.calorias || "N/A"}</span>
              <span class="nutricion-label">Calorías</span>
            </div>
            <div class="nutricion-item">
              <span class="nutricion-valor">${
                receta.macronutrientes?.proteinas || "N/A"
              }g</span>
              <span class="nutricion-label">Proteínas</span>
            </div>
            <div class="nutricion-item">
              <span class="nutricion-valor">${
                receta.macronutrientes?.carbohidratos || "N/A"
              }g</span>
              <span class="nutricion-label">Carbohidratos</span>
            </div>
            <div class="nutricion-item">
              <span class="nutricion-valor">${
                receta.macronutrientes?.grasas || "N/A"
              }g</span>
              <span class="nutricion-label">Grasas</span>
            </div>
          </div>
        </div>

        <div class="receta-actions">
          <button class="btn-editar" data-id="${recetaId}">
            ✏️ Editar Receta
          </button>
          <button class="btn-eliminar" data-id="${recetaId}">
            🗑️ Eliminar Receta
          </button>
        </div>
      </div>
    `;

  // Adjuntar listeners a los botones dentro del modal de detalles
  const btnEditar = elements.detalleContenido.querySelector(".btn-editar");
  const btnEliminar = elements.detalleContenido.querySelector(".btn-eliminar");

  if (btnEditar) {
    btnEditar.onclick = () => editarReceta(recetaId);
  }
  if (btnEliminar) {
    btnEliminar.onclick = () => eliminarReceta(recetaId);
  }
}
