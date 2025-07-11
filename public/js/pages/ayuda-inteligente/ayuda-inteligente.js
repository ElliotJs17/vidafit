export default async function () {
  // === CARGA Y VERIFICACIÓN DE LIBRERÍAS ===
  try {
    const tfScript = document.createElement("script");
    tfScript.src =
      "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.9.0/dist/tf.min.js";
    document.head.appendChild(tfScript);

    await new Promise((resolve, reject) => {
      tfScript.onload = resolve;
      tfScript.onerror = () =>
        reject(new Error("Error cargando TensorFlow.js"));
    });

    if (!window.tf) throw new Error("TensorFlow.js no se cargó correctamente");

    console.log("✅ TensorFlow.js cargado correctamente");

    const tmImageScript = document.createElement("script");
    tmImageScript.src =
      "https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js";
    document.head.appendChild(tmImageScript);

    const tmPoseScript = document.createElement("script");
    tmPoseScript.src =
      "https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js";
    document.head.appendChild(tmPoseScript);

    await Promise.all([
      new Promise((resolve, reject) => {
        tmImageScript.onload = resolve;
        tmImageScript.onerror = () =>
          reject(new Error("Error cargando tmImage"));
      }),
      new Promise((resolve, reject) => {
        tmPoseScript.onload = resolve;
        tmPoseScript.onerror = () => reject(new Error("Error cargando tmPose"));
      }),
    ]);

    console.log("✅ Teachable Machine (image y pose) cargados correctamente");
  } catch (error) {
    console.error("Error de inicialización de librerías:", error);
    const errorContainer = document.createElement("div");
    errorContainer.style.color = "red";
    errorContainer.style.padding = "20px";
    errorContainer.style.textAlign = "center";
    errorContainer.innerHTML = `
      <h3>Error al cargar librerías</h3>
      <p>No se pudieron cargar los recursos necesarios. Intenta recargar la página.</p>
      <p><small>${error.message}</small></p>
    `;
    document.getElementById("app-main-content").prepend(errorContainer);
    return { cleanup: () => {} };
  }

  // === CONSTANTES Y CONFIGURACIÓN ===
  const EJERCICIOS_GUIA = {
    sentadilla: {
      instrucciones: [
        "1. Párate con los pies separados al ancho de los hombros.",
        "2. Baja el cuerpo como si te fueras a sentar en una silla, manteniendo el pecho levantado.",
        "3. Las rodillas no deben pasar de los dedos de los pies.",
        "4. Vuelve a la posición inicial y repite.",
      ],
      puntosClave: [
        "Rodillas alineadas",
        "Espalda recta",
        "Cadera hacia atrás",
      ],
    },
    plancha: {
      instrucciones: [
        "1. Colócate boca abajo apoyando antebrazos y punta de los pies.",
        "2. Mantén el cuerpo recto como una tabla, sin arquear la espalda.",
        "3. Contrae el abdomen y glúteos.",
        "4. Mantén la posición sin moverte.",
      ],
      puntosClave: ["Cuerpo recto", "Abdomen contraído", "Cabeza alineada"],
    },
    flexiones: {
      instrucciones: [
        "1. Boca abajo, manos a la altura del pecho, más abiertas que los hombros.",
        "2. Mantén el cuerpo recto y baja el pecho hacia el suelo.",
        "3. Empuja hacia arriba hasta extender los brazos.",
        "4. Repite manteniendo la alineación.",
      ],
      puntosClave: [
        "Cuerpo recto",
        "Movimiento controlado",
        "Codos no muy abiertos",
      ],
    },
  };

  // === ELEMENTOS DEL DOM ===
  const videoComida = document.getElementById("webcamComida");
  const canvasComida = document.getElementById("canvasComida");
  const ctxComida = canvasComida.getContext("2d");
  const capturarComida = document.getElementById("capturarComida");
  const resultadoComida = document.getElementById("resultadoComida");
  const infoNutricional = document.getElementById("infoNutricional");
  const camaraComidaContainer = document.getElementById(
    "camaraComidaContainer"
  );
  const subirComidaContainer = document.getElementById("subirComidaContainer");
  const dropzoneComida = document.getElementById("dropzoneComida");
  const inputFileComida = document.getElementById("inputFileComida");
  const modoBtns = document.querySelectorAll(".modo-btn");
  const videoEjercicio = document.getElementById("webcamEjercicio");
  const resultadoEjercicio = document.getElementById("resultadoEjercicio");
  const ejercicioSeleccionado = document.getElementById(
    "ejercicioSeleccionado"
  );
  const instruccionesEjercicio = document.getElementById(
    "instruccionesEjercicio"
  );
  const puntuacionEjercicio = document.getElementById("puntuacionEjercicio");
  const puntuacionTexto = document.getElementById("puntuacionTexto");

  // === ESTADO ===
  let modeloComida = null;
  let modeloEjercicio = null;
  let streamComida = null;
  let streamEjercicio = null;
  let loopEjercicio = null;
  let ejercicioActual = null;

  // === FUNCIONES COMIDA ===
  async function iniciarCamaraComida() {
    try {
      if (streamComida) {
        streamComida.getTracks().forEach((track) => track.stop());
      }

      streamComida = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      });
      videoComida.srcObject = streamComida;

      const settings = streamComida.getVideoTracks()[0].getSettings();
      canvasComida.width = settings.width || 1280;
      canvasComida.height = settings.height || 720;

      return true;
    } catch (e) {
      console.error("Error al acceder a la cámara de comida:", e);
      resultadoComida.textContent =
        "Error al acceder a la cámara. Asegúrate de permitir el acceso.";
      return false;
    }
  }

  function detenerCamaraComida() {
    if (streamComida) {
      streamComida.getTracks().forEach((track) => track.stop());
      streamComida = null;
      videoComida.srcObject = null;
    }
  }

  async function cargarModeloComida() {
    if (modeloComida) return modeloComida;

    try {
      const tmImage = await import(
        "https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js"
      );
      const modelURL =
        "https://teachablemachine.withgoogle.com/models/ucTRDfrN2/model.json";
      const metadataURL =
        "https://teachablemachine.withgoogle.com/models/ucTRDfrN2/metadata.json";

      modeloComida = await window.tmImage.load(modelURL, metadataURL);
      console.log("Modelo de comida cargado correctamente");
      return modeloComida;
    } catch (error) {
      console.error("Error cargando modelo de comida:", error);
      throw error;
    }
  }

  async function procesarImagenComida(imageElement) {
    try {
      if (!modeloComida) await cargarModeloComida();

      const pred = await modeloComida.predict(imageElement);
      pred.sort((a, b) => b.probability - a.probability);

      const plato = pred[0].className;
      const prob = (pred[0].probability * 100).toFixed(2);

      resultadoComida.textContent = `Plato detectado: ${plato} (${prob}% de confianza)`;
      mostrarInfoNutricional(plato);
    } catch (error) {
      console.error("Error al procesar imagen:", error);
      resultadoComida.textContent =
        "Error al analizar la imagen. Intenta con otra foto.";
      infoNutricional.innerHTML = "";
    }
  }

  function mostrarInfoNutricional(plato) {
    const infoPorPlato = {
      Huancaina: {
        calorias: 550,
        proteina: "25g",
        carbohidratos: "60g",
        grasas: "20g",
        descripcion: "Plato tradicional con arroz, pollo y verduras.",
      },
      "Lomo Saltado": {
        calorias: 350,
        proteina: "15g",
        carbohidratos: "20g",
        grasas: "25g",
        descripcion:
          "Ensalada con lechuga, croutones, queso parmesano y aderezo César.",
      },
      "Sopa de Verduras": {
        calorias: 200,
        proteina: "8g",
        carbohidratos: "15g",
        grasas: "5g",
        descripcion: "Sopa ligera con variedad de verduras frescas.",
      },
      "Pasta Bolognesa": {
        calorias: 600,
        proteina: "30g",
        carbohidratos: "80g",
        grasas: "25g",
        descripcion: "Pasta con salsa de carne molida y tomate.",
      },
    };

    const info = infoPorPlato[plato] || {
      calorias: "N/A",
      proteina: "N/A",
      carbohidratos: "N/A",
      grasas: "N/A",
      descripcion: "No tenemos información nutricional para este plato.",
    };

    infoNutricional.innerHTML = `
      <h3>Información Nutricional: ${plato}</h3>
      <p class="descripcion-plato">${info.descripcion}</p>
      <ul>
        <li><strong>Calorías:</strong> ${info.calorias} kcal</li>
        <li><strong>Proteína:</strong> ${info.proteina}</li>
        <li><strong>Carbohidratos:</strong> ${info.carbohidratos}</li>
        <li><strong>Grasas:</strong> ${info.grasas}</li>
      </ul>
      <div class="consejo-nutricional">
        <strong>Consejo:</strong> ${generarConsejoNutricional(info.calorias)}
      </div>
    `;
  }

  function generarConsejoNutricional(calorias) {
    if (calorias < 300) {
      return "Esta es una comida ligera. Podrías complementarla con una porción de proteína.";
    } else if (calorias < 500) {
      return "Comida moderada en calorías. Equilibrada para una comida principal.";
    } else {
      return "Comida alta en calorías. Considera reducir las porciones si estás en un plan de pérdida de peso.";
    }
  }

  // === FUNCIONES EJERCICIOS ===
  async function iniciarCamaraEjercicio() {
    try {
      if (streamEjercicio) {
        streamEjercicio.getTracks().forEach((track) => track.stop());
      }

      streamEjercicio = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });
      videoEjercicio.srcObject = streamEjercicio;
      return true;
    } catch (e) {
      console.error("Error al acceder a la cámara de ejercicio:", e);
      resultadoEjercicio.textContent =
        "Error al acceder a la cámara. Asegúrate de permitir el acceso.";
      return false;
    }
  }

  function detenerCamaraEjercicio() {
    if (streamEjercicio) {
      streamEjercicio.getTracks().forEach((track) => track.stop());
      streamEjercicio = null;
      videoEjercicio.srcObject = null;
    }
    if (loopEjercicio) {
      cancelAnimationFrame(loopEjercicio);
      loopEjercicio = null;
    }
  }

  async function cargarModeloEjercicio() {
    if (modeloEjercicio) return modeloEjercicio;

    try {
      const tmPose = await import(
        "https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js"
      );
      const modelURL =
        "https://teachablemachine.withgoogle.com/models/XXXX_EJERCICIO/model.json";
      const metadataURL =
        "https://teachablemachine.withgoogle.com/models/XXXX_EJERCICIO/metadata.json";

      modeloEjercicio = await window.tmPose.load(modelURL, metadataURL);
      console.log("Modelo de ejercicio cargado correctamente");
      return modeloEjercicio;
    } catch (error) {
      console.error("Error cargando modelo de ejercicio:", error);
      throw error;
    }
  }

  async function detectarPostura() {
    if (!ejercicioActual) return;

    try {
      if (!modeloEjercicio) await cargarModeloEjercicio();
      if (!streamEjercicio) {
        const camaraLista = await iniciarCamaraEjercicio();
        if (!camaraLista) return;
      }

      if (loopEjercicio) cancelAnimationFrame(loopEjercicio);

      loopEjercicio = async function () {
        const pred = await modeloEjercicio.predict();
        pred.sort((a, b) => b.probability - a.probability);

        const postura = pred[0].className;
        const prob = (pred[0].probability * 100).toFixed(2);

        resultadoEjercicio.textContent = `Postura: ${postura}`;
        puntuacionEjercicio.style.width = `${prob}%`;
        puntuacionTexto.textContent = `${prob}%`;

        if (prob > 80) {
          puntuacionEjercicio.style.backgroundColor = "var(--color-success)";
        } else if (prob > 50) {
          puntuacionEjercicio.style.backgroundColor = "var(--color-warning)";
        } else {
          puntuacionEjercicio.style.backgroundColor = "var(--color-danger)";
        }

        darFeedbackEjercicio(postura, prob);
        loopEjercicio = requestAnimationFrame(loopEjercicio);
      };

      loopEjercicio();
    } catch (error) {
      console.error("Error en detección de postura:", error);
      resultadoEjercicio.textContent =
        "Error al analizar la postura. Intenta de nuevo.";
    }
  }

  function darFeedbackEjercicio(postura, probabilidad) {
    if (probabilidad < 50) {
      resultadoEjercicio.textContent +=
        " - Postura incorrecta. Revisa las instrucciones.";
    } else if (probabilidad < 80) {
      resultadoEjercicio.textContent +=
        " - Postura aceptable pero puede mejorar.";
    } else {
      resultadoEjercicio.textContent += " - ¡Excelente postura!";
    }
  }

  function mostrarInstruccionesEjercicio(ejercicio) {
    if (!ejercicio || !EJERCICIOS_GUIA[ejercicio]) {
      instruccionesEjercicio.innerHTML =
        "Selecciona un ejercicio para ver las instrucciones.";
      return;
    }

    const guia = EJERCICIOS_GUIA[ejercicio];
    instruccionesEjercicio.innerHTML = `
      <div class="pasos-ejercicio">
        <h4>Pasos:</h4>
        <ol>
          ${guia.instrucciones.map((inst) => `<li>${inst}</li>`).join("")}
        </ol>
      </div>
      <div class="puntos-clave">
        <h4>Puntos clave:</h4>
        <ul>
          ${guia.puntosClave.map((punto) => `<li>${punto}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  // === MANEJADORES DE EVENTOS ===
  capturarComida.addEventListener("click", async () => {
    try {
      capturarComida.disabled = true;
      capturarComida.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Analizando...';

      ctxComida.drawImage(
        videoComida,
        0,
        0,
        canvasComida.width,
        canvasComida.height
      );
      const img = new Image();
      img.src = canvasComida.toDataURL("image/jpeg", 0.8);

      img.onload = async () => {
        await procesarImagenComida(img);
        capturarComida.disabled = false;
        capturarComida.innerHTML = '<i class="fas fa-camera"></i> Capturar';
      };
    } catch (error) {
      console.error("Error al capturar imagen:", error);
      resultadoComida.textContent =
        "Error al capturar la imagen. Intenta de nuevo.";
      capturarComida.disabled = false;
      capturarComida.innerHTML = '<i class="fas fa-camera"></i> Capturar';
    }
  });

  modoBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modoBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (btn.dataset.modo === "camara") {
        camaraComidaContainer.style.display = "flex";
        subirComidaContainer.style.display = "none";
        iniciarCamaraComida();
      } else {
        camaraComidaContainer.style.display = "none";
        subirComidaContainer.style.display = "flex";
        detenerCamaraComida();
      }
    });
  });

  dropzoneComida.addEventListener("click", () => inputFileComida.click());

  inputFileComida.addEventListener("change", async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const img = new Image();

      img.onload = async () => {
        canvasComida.width = img.width;
        canvasComida.height = img.height;
        ctxComida.drawImage(img, 0, 0);
        await procesarImagenComida(img);
      };

      img.src = URL.createObjectURL(file);
    }
  });

  dropzoneComida.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzoneComida.style.backgroundColor = "rgba(74, 111, 165, 0.2)";
  });

  dropzoneComida.addEventListener("dragleave", () => {
    dropzoneComida.style.backgroundColor = "rgba(74, 111, 165, 0.05)";
  });

  dropzoneComida.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzoneComida.style.backgroundColor = "rgba(74, 111, 165, 0.05)";

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      inputFileComida.files = e.dataTransfer.files;
      const event = new Event("change");
      inputFileComida.dispatchEvent(event);
    }
  });

  ejercicioSeleccionado.addEventListener("change", async (e) => {
    ejercicioActual = e.target.value;
    mostrarInstruccionesEjercicio(ejercicioActual);

    if (ejercicioActual) {
      await detectarPostura();
    } else {
      detenerCamaraEjercicio();
      resultadoEjercicio.textContent = "Selecciona un ejercicio para comenzar.";
      puntuacionEjercicio.style.width = "0%";
      puntuacionTexto.textContent = "0%";
    }
  });

  // === INICIALIZACIÓN ===
  async function inicializar() {
    try {
      await iniciarCamaraComida();

      // Precargar modelos en segundo plano
      setTimeout(() => {
        cargarModeloComida().catch((e) =>
          console.error("Error precargando modelo comida:", e)
        );
        cargarModeloEjercicio().catch((e) =>
          console.error("Error precargando modelo ejercicio:", e)
        );
      }, 1000);

      resultadoComida.textContent =
        "Toma una foto de tu comida o sube una imagen para analizarla.";
      resultadoEjercicio.textContent = "Selecciona un ejercicio para comenzar.";
    } catch (error) {
      console.error("Error en inicialización:", error);
    }
  }

  await inicializar();

  // === LIMPIEZA ===
  return {
    cleanup() {
      detenerCamaraComida();
      detenerCamaraEjercicio();
      modeloComida = null;
      modeloEjercicio = null;
    },
  };
}
