export function parseLLMText(text) {
  if (!text) return "";

  // Escapar HTML básico
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Negrita: **texto**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Cursiva: *texto*
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Código en línea: `código`
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  // Saltos de línea
  html = html.replace(/\n/g, "<br>");

  // Elimina comas en miles
  text = text.replace(/(\d),(\d{3})/g, "$1$2");

  return html;
}

export function sanitizeMathContent(text) {
  return text.replace(/\\\[(.*?)\\\]/gs, (match, inner) => {
    const cleaned = inner.replace(/\s*\n\s*/g, " ").trim();
    return `\\[${cleaned}\\]`;
  });
}

export function normalizeMultilineLatex(text) {
  // Une líneas dentro de bloques \[ ... \]
  return text.replace(/\\\[(.*?)\\\]/gs, (match, inner) => {
    const cleaned = inner.replace(/\s*\n\s*/g, " ").trim();
    return `\\[${cleaned}\\]`;
  });
}
