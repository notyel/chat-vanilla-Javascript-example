import { sanitizeMathContent } from "./textParser.js";
import { marked } from "./libs/marked/marked.esm.js";

const sendButton = document.querySelector("#send-message-button");
const input = document.querySelector("input");
const output = document.querySelector("#output");
const chatSection = document.querySelector("#chat-section");

async function getMessage() {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Agrega el mensaje del usuario al historial
  addMessage("user", userMessage);

  // Crear el contenedor del mensaje del asistente
  const loadingMessage = addMessage("assistant", "");
  loadingMessage.classList.add("loading");

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "microsoft/phi-4",
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_tokens: 540,
      stream: true,
    }),
  };

  try {
    const response = await fetch(
      "http://127.0.0.1:1234/v1/chat/completions",
      options
    );

    if (!response.ok || !response.body) {
      throw new Error("La respuesta no es válida.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let assistantReply = "";
    let firstChunkReceived = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      const lines = chunk
        .split("\n")
        .filter((line) => line.trim().startsWith("data:"));

      for (const line of lines) {
        const jsonStr = line.replace(/^data:\s*/, "");

        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;

          if (content) {
            assistantReply += content;
            const cleaned = sanitizeMathContent(assistantReply, {
              sanitize: false,
            });

            loadingMessage.innerHTML = marked.parse(cleaned);
            scrollToBottom();

            // Quitar clase "loading" al recibir el primer fragmento
            if (!firstChunkReceived) {
              firstChunkReceived = true;
              loadingMessage.classList.remove("loading");
            }

            // Render LaTeX si aplica
            if (window.MathJax) {
              await MathJax.typesetClear([loadingMessage]);
              await MathJax.typesetPromise([loadingMessage]);
              scrollToBottom();
            }
          }
        } catch (e) {
          console.warn("Error al parsear JSON del stream:", e);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    loadingMessage.textContent = "Error al obtener respuesta.";
    loadingMessage.classList.remove("loading");
  }

  input.value = "";
}

function addMessage(role, text) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("message", role);

  const contentEl = document.createElement("div");
  contentEl.classList.add("message-content");
  contentEl.textContent = text;

  messageEl.appendChild(contentEl);
  output.appendChild(messageEl);

  scrollToBottom();
  return contentEl;
}

// Desplazar hacia abajo para mostrar el nuevo mensaje
function scrollToBottom() {
  chatSection.scrollTop = chatSection.scrollHeight;
}

sendButton.addEventListener("click", getMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") getMessage();
});
