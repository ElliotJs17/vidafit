// public/js/pages/recetas/recetas.filters.js

import elements from "./recetas.elements.js";
import { utils } from "./recetas.utils.js";
import { renderRecetas } from "./recetas.render.js";

let _todasLasRecetas = [];
let _recetasFiltradas = [];

export function setTodasLasRecetas(recetas) {
  _todasLasRecetas = recetas;
  _recetasFiltradas = [...recetas]; // Inicialmente, filtradas son todas
}

export function getRecetasFiltradas() {
  return _recetasFiltradas;
}

export function getTodasLasRecetas() {
  return _todasLasRecetas;
}

export function filtrarRecetas() {
  const searchTerm = utils
    .sanitizeInput(elements.searchInput.value)
    .toLowerCase();
  const categoria = elements.filtroCategoria.value;
  const dificultad = elements.filtroDificultad.value;
  const tiempoMax = elements.filtroTiempo.value;
  const caloriasMax = elements.filtroCalorias.value;

  _recetasFiltradas = _todasLasRecetas.filter((receta) => {
    // Búsqueda difusa en múltiples campos
    const matchSearch =
      !searchTerm ||
      [
        receta.nombre?.toLowerCase(),
        receta.descripcion?.toLowerCase(),
        ...(receta.ingredientes?.map((i) => i.nombre?.toLowerCase()) || []),
        ...(receta.keywords?.map((k) => k.toLowerCase()) || []),
      ].some((field) => field?.includes(searchTerm));

    // Filtros exactos
    const matchCategoria = !categoria || receta.categoria === categoria;
    const matchDificultad = !dificultad || receta.dificultad === dificultad;
    const matchTiempo =
      !tiempoMax ||
      (receta.tiempoPreparacion &&
        receta.tiempoPreparacion <= parseInt(tiempoMax));
    const matchCalorias =
      !caloriasMax ||
      (receta.calorias && receta.calorias <= parseInt(caloriasMax));

    return (
      matchSearch &&
      matchCategoria &&
      matchDificultad &&
      matchTiempo &&
      matchCalorias
    );
  });

  renderRecetas(_recetasFiltradas, _todasLasRecetas);
}

export function limpiarFiltros() {
  if (elements.searchInput) elements.searchInput.value = "";
  if (elements.filtroCategoria) elements.filtroCategoria.selectedIndex = 0;
  if (elements.filtroDificultad) elements.filtroDificultad.selectedIndex = 0;
  if (elements.filtroTiempo) elements.filtroTiempo.selectedIndex = 0;
  if (elements.filtroCalorias) elements.filtroCalorias.selectedIndex = 0;
  filtrarRecetas();
}

export const debouncedFilter = utils.debounce(filtrarRecetas, 300);
