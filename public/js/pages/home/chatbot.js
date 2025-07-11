// public/js/pages/home/chatbot.js

let isChatbotOpen = false;
let isTyping = false;

function toggleChatbot() {
  const chatbotWindow = document.getElementById("chatbotWindow");
  const chatbotButton = document.querySelector(".chatbot-button");
  if (isChatbotOpen) {
    closeChatbot();
  } else {
    chatbotWindow.classList.add("active");
    chatbotButton.classList.remove("pulse");
    isChatbotOpen = true;
    setTimeout(() => {
      document.getElementById("messageInput").focus();
    }, 400);
  }
}

function closeChatbot() {
  const chatbotWindow = document.getElementById("chatbotWindow");
  const chatbotButton = document.querySelector(".chatbot-button");
  chatbotWindow.classList.remove("active");
  chatbotButton.classList.add("pulse");
  isChatbotOpen = false;
}

function sendQuickMessage(message) {
  const messageInput = document.getElementById("messageInput");
  messageInput.value = message;
  sendMessage();
}

async function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const message = messageInput.value.trim();

  if (!message || isTyping) return;

  addMessage(message, true);
  messageInput.value = "";
  sendBtn.disabled = true;
  isTyping = true;
  showTypingIndicator();

  try {
    const response = await fetch("http://localhost:3000/chatfit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mensaje: message }),
    });

    const data = await response.json();
    setTimeout(() => {
      hideTypingIndicator();
      if (response.ok) {
        addMessage(data.respuesta);
      } else {
        addMessage(`❌ Lo siento, hubo un error: ${data.error}`);
      }
      sendBtn.disabled = false;
      isTyping = false;
    }, 1000);
  } catch (error) {
    hideTypingIndicator();
    addMessage("❌ No se pudo conectar con el servidor.");
    sendBtn.disabled = false;
    isTyping = false;
  }
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

function addMessage(content, isUser = false) {
  const messagesContainer = document.getElementById("messagesContainer");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user" : "bot"}`;
  messageDiv.innerHTML = `
    <div class="message-avatar">${isUser ? "👤" : "🤖"}</div>
    <div class="message-content">${content.replace(/\n/g, "<br>")}</div>
  `;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById("messagesContainer");
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot";
  typingDiv.id = "typingIndicator";
  typingDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="typing-indicator" style="display: flex;">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) typingIndicator.remove();
}

// 🔑 Exponer funciones al global (window)
window.toggleChatbot = toggleChatbot;
window.closeChatbot = closeChatbot;
window.sendQuickMessage = sendQuickMessage;
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
