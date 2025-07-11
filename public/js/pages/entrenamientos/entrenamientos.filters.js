// public/js/pages/entrenamientos/entrenamientos.filters.js

import elements from "./entrenamientos.elements.js";
import { utils } from "./entrenamientos.utils.js";
import { renderEntrenamientos } from "./entrenamientos.render.js";

let _todosLosEntrenamientos = [];
let _entrenamientosFiltrados = [];

export function setTodosLosEntrenamientos(entrenamientos) {
  _todosLosEntrenamientos = entrenamientos;
  _entrenamientosFiltrados = [...entrenamientos];
}

export function getEntrenamientosFiltrados() {
  return _entrenamientosFiltrados;
}

export function getTodosLosEntrenamientos() {
  return _todosLosEntrenamientos;
}

export function filtrarEntrenamientos() {
  const searchTerm = utils
    .sanitizeInput(elements.searchInput.value)
    .toLowerCase();
  const tipo = elements.filtroTipo.value;
  const nivel = elements.filtroNivel.value;
  const duracionMax = elements.filtroDuracion.value;
  const equipamiento = elements.filtroEquipamiento.value;

  _entrenamientosFiltrados = _todosLosEntrenamientos.filter((entrenamiento) => {
    const matchSearch =
      !searchTerm ||
      [
        entrenamiento.nombre?.toLowerCase(),
        entrenamiento.descripcion?.toLowerCase(),
        ...(entrenamiento.ejercicios?.map((e) => e.nombre?.toLowerCase()) ||
          []),
        ...(entrenamiento.keywords?.map((k) => k.toLowerCase()) || []),
      ].some((field) => field?.includes(searchTerm));

    const matchTipo = !tipo || entrenamiento.tipo === tipo;
    const matchNivel = !nivel || entrenamiento.nivel === nivel;
    const matchDuracion =
      !duracionMax ||
      (entrenamiento.duracion &&
        entrenamiento.duracion <= parseInt(duracionMax));
    const matchEquipamiento =
      !equipamiento ||
      (entrenamiento.equipamiento &&
        entrenamiento.equipamiento
          .toLowerCase()
          .includes(equipamiento.toLowerCase()));

    return (
      matchSearch &&
      matchTipo &&
      matchNivel &&
      matchDuracion &&
      matchEquipamiento
    );
  });

  renderEntrenamientos(_entrenamientosFiltrados, _todosLosEntrenamientos);
}

export function limpiarFiltros() {
  if (elements.searchInput) elements.searchInput.value = "";
  if (elements.filtroTipo) elements.filtroTipo.selectedIndex = 0;
  if (elements.filtroNivel) elements.filtroNivel.selectedIndex = 0;
  if (elements.filtroDuracion) elements.filtroDuracion.selectedIndex = 0;
  if (elements.filtroEquipamiento)
    elements.filtroEquipamiento.selectedIndex = 0;
  filtrarEntrenamientos();
}

export const debouncedFilter = utils.debounce(filtrarEntrenamientos, 300);
