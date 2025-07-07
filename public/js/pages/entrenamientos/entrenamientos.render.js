// public/js/pages/entrenamientos/entrenamientos.render.js

import { utils } from "./entrenamientos.utils.js";
import elements from "./entrenamientos.elements.js";
import {
  showEntrenamientoDetails,
  editarEntrenamiento,
  eliminarEntrenamiento,
} from "./entrenamientos.crud.js";

export function renderEntrenamientoCard(entrenamiento) {
  const keywords = entrenamiento.keywords || [];
  const tagsHtml = keywords
    .slice(0, 3)
    .map((tag) => `<span class="tag">${utils.sanitizeInput(tag)}</span>`)
    .join("");

  const imagenHtml = entrenamiento.imagenUrl
    ? `<div class="entrenamiento-imagen" style="background-image: url('${entrenamiento.imagenUrl}');"></div>`
    : '<div class="entrenamiento-imagen placeholder">🏋️</div>';

  return `
    <div class="entrenamiento-card" data-id="${entrenamiento.id}">     
      <div class="entrenamiento-header">        
      ${imagenHtml}
        <span class="nivel-badge">
          ${utils.getLevelEmoji(entrenamiento.nivel)} ${entrenamiento.nivel}
        </span>
      </div>
      <div class="entrenamiento-body">
        <h3 class="entrenamiento-title">${utils.sanitizeInput(
          entrenamiento.nombre
        )}</h3>
        <div class="entrenamiento-meta">
          <span class="meta-item">
            <span>⏱️</span> ${utils.formatTime(entrenamiento.duracion)}
          </span>
          <span class="meta-item">
            <span>${utils.getTypeEmoji(entrenamiento.tipo)}</span> 
            ${entrenamiento.tipo}
          </span>
          <span class="meta-item">
            <span>🔥</span> ${entrenamiento.calorias || "N/A"} cal
          </span>
        </div>
        <p class="entrenamiento-desc">${utils.truncateText(
          utils.sanitizeInput(entrenamiento.descripcion)
        )}</p>
        ${tagsHtml ? `<div class="entrenamiento-tags">${tagsHtml}</div>` : ""}
        <button class="btn-detalles" data-id="${entrenamiento.id}">
          Ver Detalles
        </button>
      </div>
    </div>
  `;
}

export function renderEntrenamientos(
  entrenamientosFiltrados,
  todosLosEntrenamientos
) {
  if (!elements.entrenamientosGrid) return;

  if (entrenamientosFiltrados.length === 0) {
    if (todosLosEntrenamientos.length === 0) {
      utils.showEmpty(elements);
    } else {
      utils.showNoResults(elements);
    }
    elements.entrenamientosGrid.innerHTML = "";
    return;
  }

  utils.showResults(elements, entrenamientosFiltrados.length);
  elements.entrenamientosGrid.innerHTML = entrenamientosFiltrados
    .map(renderEntrenamientoCard)
    .join("");

  const oldEntrenamientosGrid = elements.entrenamientosGrid;
  const newEntrenamientosGrid = oldEntrenamientosGrid.cloneNode(true);
  oldEntrenamientosGrid.parentNode.replaceChild(
    newEntrenamientosGrid,
    oldEntrenamientosGrid
  );
  elements.entrenamientosGrid = newEntrenamientosGrid;

  elements.entrenamientosGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".entrenamiento-card");
    const detailsBtn = e.target.closest(".btn-detalles");

    if (card && !detailsBtn) {
      const entrenamientoId = card.dataset.id;
      showEntrenamientoDetails(entrenamientoId);
    }

    if (detailsBtn) {
      e.stopPropagation();
      const entrenamientoId = detailsBtn.dataset.id;
      showEntrenamientoDetails(entrenamientoId);
    }
  });
}

export function renderEntrenamientoDetails(entrenamiento, entrenamientoId) {
  elements.detalleTitulo.textContent = entrenamiento.nombre;

  const ejerciciosHtml =
    entrenamiento.ejercicios
      ?.map(
        (ej) => `
        <li>
          <span class="ejercicio-nombre">${utils.sanitizeInput(
            ej.nombre
          )}</span>
          <span class="ejercicio-detalle">${ej.series} x ${utils.sanitizeInput(
          ej.repeticiones
        )}</span>
        </li>
      `
      )
      ?.join("") || "";

  const instruccionesHtml =
    entrenamiento.instrucciones
      ?.map(
        (inst, index) => `
        <li>
          <span class="instruccion-numero">${index + 1}.</span>
          <span class="instruccion-texto">${utils.sanitizeInput(inst)}</span>
        </li>
      `
      )
      ?.join("") || "";

  const tagsHtml =
    entrenamiento.keywords
      ?.map((tag) => `<span class="tag">${utils.sanitizeInput(tag)}</span>`)
      ?.join("") || "";

  const imagenHtml = entrenamiento.imagenUrl
    ? `<div class="entrenamiento-detalle-imagen"><img src="${
        entrenamiento.imagenUrl
      }" alt="${utils.sanitizeInput(
        entrenamiento.nombre
      )}" style="max-width: 100%; max-height: 300px; object-fit: contain;"></div>`
    : "";

  elements.detalleContenido.innerHTML = `
      ${imagenHtml}
      <div class="entrenamiento-detalle-header">
        <h3>${utils.sanitizeInput(entrenamiento.nombre)}</h3>
        <div class="entrenamiento-meta-detalle">
          <span class="entrenamiento-meta-item">
            <span>${utils.getTypeEmoji(entrenamiento.tipo)}</span> ${
    entrenamiento.tipo
  }
          </span>
          <span class="entrenamiento-meta-item">
            <span>${utils.getLevelEmoji(entrenamiento.nivel)}</span> ${
    entrenamiento.nivel
  }
          </span>
          <span class="entrenamiento-meta-item">
            <span>⏱️</span> ${utils.formatTime(entrenamiento.duracion)}
          </span>
          <span class="entrenamiento-meta-item">
            <span>🔥</span> ${
              entrenamiento.calorias || "N/A"
            } calorías estimadas
          </span>
          ${
            entrenamiento.equipamiento
              ? `
          <span class="entrenamiento-meta-item">
            <span>🏋️‍♂️</span> ${utils.sanitizeInput(entrenamiento.equipamiento)}
          </span>
          `
              : ""
          }
        </div>
        ${tagsHtml ? `<div class="entrenamiento-tags">${tagsHtml}</div>` : ""}
      </div>

      <div class="entrenamiento-detalle-body">
        ${
          entrenamiento.descripcion
            ? `
          <div class="entrenamiento-descripcion">
            <h4>Descripción</h4>
            <p>${utils.sanitizeInput(entrenamiento.descripcion)}</p>
          </div>
        `
            : ""
        }

        <div class="entrenamiento-section ejercicios-section">
          <h4>Ejercicios</h4>
          <ul class="ejercicios-list">${ejerciciosHtml}</ul>
        </div>

        <div class="entrenamiento-section instrucciones-section">
          <h4>Instrucciones</h4>
          <ol class="instrucciones-list">${instruccionesHtml}</ol>
        </div>

        <div class="entrenamiento-section metricas-section">
          <h4>Métricas</h4>
          <div class="metricas-grid">
            <div class="metricas-item">
              <span class="metricas-valor">${
                entrenamiento.duracion || "N/A"
              }</span>
              <span class="metricas-label">Duración (min)</span>
            </div>
            <div class="metricas-item">
              <span class="metricas-valor">${
                entrenamiento.calorias || "N/A"
              }</span>
              <span class="metricas-label">Calorías</span>
            </div>
            <div class="metricas-item">
              <span class="metricas-valor">${
                entrenamiento.ejercicios?.length || "N/A"
              }</span>
              <span class="metricas-label">Ejercicios</span>
            </div>
            <div class="metricas-item">
              <span class="metricas-valor">${
                entrenamiento.objetivo || "N/A"
              }</span>
              <span class="metricas-label">Objetivo</span>
            </div>
          </div>
        </div>

        <div class="entrenamiento-actions">
          <button class="btn-editar" data-id="${entrenamientoId}">
            ✏️ Editar Entrenamiento
          </button>
          <button class="btn-eliminar" data-id="${entrenamientoId}">
            🗑️ Eliminar Entrenamiento
          </button>
        </div>
      </div>
    `;

  const btnEditar = elements.detalleContenido.querySelector(".btn-editar");
  const btnEliminar = elements.detalleContenido.querySelector(".btn-eliminar");

  if (btnEditar) {
    btnEditar.onclick = () => editarEntrenamiento(entrenamientoId);
  }
  if (btnEliminar) {
    btnEliminar.onclick = () => eliminarEntrenamiento(entrenamientoId);
  }
}
