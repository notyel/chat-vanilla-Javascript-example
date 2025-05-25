
  const sendButton = document.querySelector("#send-message-button");
  const input = document.querySelector("input");
  const output = document.querySelector("#output");

  async function getMessage() {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Agrega el mensaje del usuario al historial
    addMessage("user", userMessage);

    // Mostrar mensaje de carga
    const loadingMessage = addMessage("assistant", "Cargando...");
    loadingMessage.classList.add("loading");

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "microsoft/phi-4",
        messages: [
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 100
      })
    };

    try {
      const response = await fetch("http://127.0.0.1:1234/v1/chat/completions", options);
      const data = await response.json();
      const assistantReply = data.choices?.[0]?.message?.content || "Sin respuesta.";

      // Reemplaza el mensaje de "Cargando..." por la respuesta real
      loadingMessage.textContent = assistantReply;
      loadingMessage.classList.remove("loading");
      scrollToBottom();
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
    messageEl.textContent = text;
    output.appendChild(messageEl);

    // Desplazar hacia abajo para mostrar el nuevo mensaje
    scrollToBottom();
    return messageEl;
  }

  function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
  }

  sendButton.addEventListener("click", getMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") getMessage();
  });

