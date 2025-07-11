const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Cargar variables del archivo .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Verificar que la API key esté configurada
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY no está configurada en el archivo .env");
  process.exit(1);
}

// Inicializar Gemini con tu API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ mensaje: "🤖 Chatbot servidor funcionando correctamente" });
});

// Ruta principal del chatbot
app.post("/chatfit", async (req, res) => {
  const { mensaje } = req.body;

  // Validar que el mensaje no esté vacío
  if (!mensaje || mensaje.trim() === "") {
    return res.status(400).json({ error: "El mensaje no puede estar vacío" });
  }

  try {
    console.log("📩 Mensaje recibido:", mensaje);

    // Usamos generateContent para obtener respuesta
    const result = await model.generateContent(`
Eres un chatbot experto en rutinas de ejercicio y alimentación saludable. Tu función es recomendar exclusivamente ejercicios físicos (como rutinas para abdominales, fuerza, cardio, estiramientos, etc.) y sugerir comidas saludables según los objetivos del usuario.

Responde de manera clara, amigable y práctica. Si te preguntan algo que no esté relacionado con fitness o alimentación, redirige la conversación hacia estos temas.

Usuario: ${mensaje}
    `);

    const response = await result.response;
    const respuestaTexto = response.text();
    
    console.log("✅ Respuesta generada exitosamente");
    res.json({ respuesta: respuestaTexto });

  } catch (err) {
    console.error("❌ Error en la API de Gemini:", err);
    
    // Manejo específico de errores comunes
    if (err.message.includes("API key")) {
      res.status(401).json({ error: "Error de autenticación: Verifica tu API key" });
    } else if (err.message.includes("quota")) {
      res.status(429).json({ error: "Límite de API excedido. Intenta más tarde." });
    } else {
      res.status(500).json({ error: "Error interno del servidor: " + err.message });
    }
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🤖 Endpoint del chatbot: http://localhost:${PORT}/chatfit`);
});