export function sanitizeMathContent(text) {
  return text
    .replace(/\\\[(.*?)\\\]/gs, (_, eq) => `$$${eq}$$`)
    .replace(/\\\((.*?)\\\)/gs, (_, eq) => `$${eq}$`);
}
