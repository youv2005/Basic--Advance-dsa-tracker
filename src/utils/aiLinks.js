// External AI providers. The prompt is encoded into the URL where supported;
// the same prompt is also copied to the clipboard as a fallback because some
// providers change their deep-link/query behavior over time.

export const AI_PROVIDERS = [
  { id: "chatgpt", name: "ChatGPT", baseUrl: "https://chatgpt.com/", queryKey: "q" },
  { id: "gemini", name: "Gemini", baseUrl: "https://gemini.google.com/app", queryKey: "q" },
  { id: "claude", name: "Claude", baseUrl: "https://claude.ai/new", queryKey: "q" },
  { id: "perplexity", name: "Perplexity", baseUrl: "https://www.perplexity.ai/", queryKey: "q" },
  { id: "copilot", name: "Microsoft Copilot", baseUrl: "https://copilot.microsoft.com/", queryKey: "q" },
];

export async function openAiTutor(provider, prompt) {
  try {
    await navigator.clipboard?.writeText(prompt);
  } catch {
    // Clipboard permission can be unavailable; opening the provider still works.
  }

  const url = `${provider.baseUrl}?${provider.queryKey}=${encodeURIComponent(prompt)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
