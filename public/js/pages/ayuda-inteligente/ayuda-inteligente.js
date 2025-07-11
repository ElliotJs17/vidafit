export default async function () {
  // === CARGA Y VERIFICACIÓN DE LIBRERÍAS ===
  try {
    // Cargar TensorFlow.js primero
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

    // Esperar a que TensorFlow.js esté completamente listo
    await window.tf.ready();
    console.log("✅ TensorFlow.js cargado y listo");

    // Cargar Teachable Machine después de TensorFlow.js
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
  let isAnalyzing = false;

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
      "Lomo Saltado": {
        calorias: 550,
        proteina: "30g",
        carbohidratos: "40g",
        grasas: "25g",
        descripcion:
          "Salteado de carne, cebolla, tomate y papas fritas con arroz.",
      },
      "Aji de Gallina": {
        calorias: 480,
        proteina: "28g",
        carbohidratos: "35g",
        grasas: "22g",
        descripcion:
          "Guiso cremoso de gallina con ají amarillo, pan y leche, acompañado de arroz.",
      },
      "Causa Limeña": {
        calorias: 400,
        proteina: "15g",
        carbohidratos: "30g",
        grasas: "20g",
        descripcion:
          "Puré de papa amarilla relleno de pollo o atún con mayonesa.",
      },
      "Seco de Res con Frijoles": {
        calorias: 650,
        proteina: "35g",
        carbohidratos: "50g",
        grasas: "30g",
        descripcion:
          "Estofado de carne de res con culantro, acompañado de frijoles y arroz.",
      },
      Tallarines: {
        calorias: 700,
        proteina: "35g",
        carbohidratos: "60g",
        grasas: "35g",
        descripcion:
          "Pasta con salsa de albahaca y espinaca, servido con bistec frito.",
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
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      videoEjercicio.srcObject = streamEjercicio;

      // Esperar a que el video esté completamente cargado
      return new Promise((resolve, reject) => {
        videoEjercicio.onloadedmetadata = () => {
          videoEjercicio
            .play()
            .then(() => {
              console.log("Video de ejercicio iniciado correctamente");
              resolve(true);
            })
            .catch(reject);
        };
        videoEjercicio.onerror = reject;
      });
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
    isAnalyzing = false;
  }

  async function cargarModeloEjercicio() {
    if (modeloEjercicio) return modeloEjercicio;

    try {
      const modelURL =
        "https://teachablemachine.withgoogle.com/models/_s2kqbYtw/model.json";
      const metadataURL =
        "https://teachablemachine.withgoogle.com/models/_s2kqbYtw/metadata.json";

      modeloEjercicio = await window.tmPose.load(modelURL, metadataURL);
      console.log("Modelo de ejercicio cargado correctamente");
      return modeloEjercicio;
    } catch (error) {
      console.error("Error cargando modelo de ejercicio:", error);
      throw error;
    }
  }

  async function analizarPoseSentadilla() {
    try {
      // Verificar que el video esté listo y reproduciendo
      if (
        !videoEjercicio ||
        videoEjercicio.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA ||
        videoEjercicio.paused
      ) {
        return null;
      }

      // Verificar que el modelo esté cargado
      if (!modeloEjercicio) {
        await cargarModeloEjercicio();
      }

      // Usar estimatePose directamente con el elemento video
      const prediction = await modeloEjercicio.estimatePose(videoEjercicio);
      return prediction;
    } catch (error) {
      console.error("Error analizando pose:", error);
      return null;
    }
  }

  function evaluarSentadilla(prediction) {
    if (!prediction || !prediction.pose || !prediction.pose.keypoints) {
      return {
        esCorrecta: false,
        mensaje: "No se detectó postura",
        puntuacion: 0,
      };
    }

    const keypoints = prediction.pose.keypoints;

    // Obtener puntos clave con verificación de confianza
    const obtenerPunto = (nombre) => {
      const punto = keypoints.find((k) => k.part === nombre);
      return punto && punto.score > 0.5 ? punto : null;
    };

    const nariz = obtenerPunto("nose");
    const caderaIzq = obtenerPunto("leftHip");
    const caderaDer = obtenerPunto("rightHip");
    const rodillaIzq = obtenerPunto("leftKnee");
    const rodillaDer = obtenerPunto("rightKnee");
    const tobilloIzq = obtenerPunto("leftAnkle");
    const tobilloDer = obtenerPunto("rightAnkle");
    const hombroIzq = obtenerPunto("leftShoulder");
    const hombroDer = obtenerPunto("rightShoulder");

    // Verificar que tengamos suficientes puntos clave
    const puntosRequeridos = [
      caderaIzq,
      caderaDer,
      rodillaIzq,
      rodillaDer,
      tobilloIzq,
      tobilloDer,
    ];
    const puntosValidos = puntosRequeridos.filter((p) => p !== null);

    if (puntosValidos.length < 4) {
      return {
        esCorrecta: false,
        mensaje: "Posiciónate mejor frente a la cámara",
        puntuacion: 0,
      };
    }

    // Evaluar criterios de forma
    let puntuacion = 100;
    const errores = [];

    // 1. Profundidad de la sentadilla (usando caderas y rodillas)
    if (caderaIzq && rodillaIzq) {
      const profundidad = caderaIzq.position.y - rodillaIzq.position.y;
      if (profundidad < 20) {
        errores.push("Baja más en la sentadilla");
        puntuacion -= 30;
      }
    }

    // 2. Alineación de rodillas (no deben pasar mucho los tobillos)
    if (rodillaIzq && tobilloIzq) {
      const desplazamientoIzq = Math.abs(
        rodillaIzq.position.x - tobilloIzq.position.x
      );
      if (desplazamientoIzq > 50) {
        errores.push("Rodilla izquierda muy adelantada");
        puntuacion -= 20;
      }
    }

    if (rodillaDer && tobilloDer) {
      const desplazamientoDer = Math.abs(
        rodillaDer.position.x - tobilloDer.position.x
      );
      if (desplazamientoDer > 50) {
        errores.push("Rodilla derecha muy adelantada");
        puntuacion -= 20;
      }
    }

    // 3. Postura del torso (usando hombros y caderas)
    if (hombroIzq && hombroDer && caderaIzq && caderaDer) {
      const centroHombros = (hombroIzq.position.x + hombroDer.position.x) / 2;
      const centroCaderas = (caderaIzq.position.x + caderaDer.position.x) / 2;
      const inclinacion = Math.abs(centroHombros - centroCaderas);

      if (inclinacion > 40) {
        errores.push("Mantén el torso más erguido");
        puntuacion -= 25;
      }
    }

    // Asegurar que la puntuación no sea negativa
    puntuacion = Math.max(0, puntuacion);

    const esCorrecta = errores.length === 0;
    const mensaje = esCorrecta ? "¡Excelente forma!" : errores.join(", ");

    return { esCorrecta, mensaje, puntuacion };
  }

  async function detectarPostura() {
    if (!ejercicioActual || isAnalyzing) return;

    try {
      // Cargar modelo si no está cargado
      if (!modeloEjercicio) {
        resultadoEjercicio.textContent = "Cargando modelo de ejercicio...";
        await cargarModeloEjercicio();
      }

      // Iniciar cámara si no está activa
      if (!streamEjercicio) {
        resultadoEjercicio.textContent = "Iniciando cámara...";
        const camaraLista = await iniciarCamaraEjercicio();
        if (!camaraLista) return;
      }

      isAnalyzing = true;
      resultadoEjercicio.textContent = "Analizando postura...";

      // Detener loop anterior si existe
      if (loopEjercicio) {
        cancelAnimationFrame(loopEjercicio);
      }

      // Función de bucle de análisis
      const ejecutarLoop = async () => {
        if (!isAnalyzing || !ejercicioActual) return;

        try {
          if (ejercicioActual === "sentadilla") {
            const prediction = await analizarPoseSentadilla();

            if (prediction) {
              const { esCorrecta, mensaje, puntuacion } =
                evaluarSentadilla(prediction);

              // Actualizar interfaz
              resultadoEjercicio.textContent = `Sentadilla: ${mensaje}`;
              puntuacionEjercicio.style.width = `${puntuacion}%`;
              puntuacionTexto.textContent = `${puntuacion}%`;

              // Cambiar color según puntuación
              if (puntuacion >= 80) {
                puntuacionEjercicio.style.backgroundColor = "#4CAF50"; // Verde
              } else if (puntuacion >= 60) {
                puntuacionEjercicio.style.backgroundColor = "#FF9800"; // Naranja
              } else {
                puntuacionEjercicio.style.backgroundColor = "#F44336"; // Rojo
              }
            } else {
              resultadoEjercicio.textContent = "Posiciónate frente a la cámara";
              puntuacionEjercicio.style.width = "0%";
              puntuacionTexto.textContent = "0%";
            }
          } else {
            resultadoEjercicio.textContent = "Ejercicio no implementado";
            puntuacionEjercicio.style.width = "0%";
            puntuacionTexto.textContent = "0%";
          }
        } catch (error) {
          console.error("Error en el bucle de detección:", error);
          resultadoEjercicio.textContent = "Error al analizar postura";
        }

        // Continuar el bucle si sigue analizando
        if (isAnalyzing) {
          loopEjercicio = requestAnimationFrame(ejecutarLoop);
        }
      };

      // Iniciar el bucle
      ejecutarLoop();
    } catch (error) {
      console.error("Error en detección de postura:", error);
      resultadoEjercicio.textContent =
        "Error al inicializar análisis de postura";
      isAnalyzing = false;
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
    // Detener análisis anterior
    isAnalyzing = false;
    if (loopEjercicio) {
      cancelAnimationFrame(loopEjercicio);
      loopEjercicio = null;
    }

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
      }, 2000);

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
      isAnalyzing = false;
      if (loopEjercicio) {
        cancelAnimationFrame(loopEjercicio);
      }
      modeloComida = null;
      modeloEjercicio = null;
    },
  };
}
