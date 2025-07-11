// calendar-init.js

export function crearEventosDesdePlan(plan) {
  const eventos = [];

  plan.dias.forEach((dia) => {
    let fechaISO = "";

    // Verifica si la fecha es válida (espera "YYYY-MM-DD")
    const fechaObj = new Date(dia.fecha);
    if (isNaN(fechaObj.getTime())) {
      console.warn("❌ Fecha inválida en el plan:", dia.fecha);
      return; // Salta este día
    }

    fechaISO = fechaObj.toISOString().split("T")[0];

    // ✅ Entrenamientos
    dia.entrenamientos.forEach((entreno) => {
      if (entreno?.nombre) {
        eventos.push({
          title: `🏋️ ${entreno.nombre}`,
          start: fechaISO,
          color: "#f67280",
        });
      }
    });

    // ✅ Comidas
    dia.comidas.forEach((comida) => {
      if (comida?.receta?.nombre) {
        eventos.push({
          title: `🍽️ ${comida.tipo}: ${comida.receta.nombre}`,
          start: fechaISO,
          color: "#36b37e",
        });
      }
    });
  });

  return eventos;
}


export function initCalendar(events = []) {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridWeek",
    locale: "es",
    height: 600,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,dayGridWeek,dayGridDay",
    },
    events: events,
  });

  calendar.render();
}
