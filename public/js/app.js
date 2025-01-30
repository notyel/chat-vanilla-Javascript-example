const API_KEY = "";
const submitButton = document.querySelector("#send-message-button");
const outPutElement = document.querySelector("#output");
const inPutElement = document.querySelector("input");
const historyElement = document.querySelector(".history");
const buttonElement = document.querySelector("button");

function changeInput(value) {
  const inputElement = document.querySelector("input");
  inputElement.value = value;
}

async function getMessage() {
  console.log(
    `Button clicked: Fetching message from API with input: ${inPutElement.value}`
  );

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: inPutElement.value,
        },
      ],
      max_tokens: 100,
    }),
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );
    const data = await response.json();

    console.log(`API response received: `, data);
    outPutElement.textContent = data.choices[0].message.content;

    if (data.choices[0].message.content && inPutElement.value) {
      const pElement = document.createElement("p");
      pElement.textContent = inPutElement.value;
      pElement.addEventListener("click", () =>
        changeInput(pElement.textContent)
      );

      historyElement.append(pElement);
      console.log(`Added to history: ${inPutElement.value}`);
    }
  } catch (error) {
    console.error(`Error fetching message from API:`, error);
  }
}

submitButton.addEventListener("click", getMessage);

function clearInput() {
  console.log(`Input cleared.`);
  inPutElement.value = "";
}

buttonElement.addEventListener("click", clearInput);
