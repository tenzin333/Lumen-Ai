chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "lumenAsk",
    title: "Ask Lumen about '%s'",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "lumenAsk") {
    const selectedText = info.selectionText;

    // Promisify chrome.storage.local.get result
    const data = await new Promise((resolve) => {
      chrome.storage.local.get(['apiKey', 'resume', 'tone'], (items) => resolve(items));
    });

    // 2. Immediate feedback: Tell content script to show a "loading" widget
    if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { action: "SHOW_LOADING" });

    // 2a. Validate API key presence
    if (!data || !data.apiKey) {
      if (tab && tab.id) {
        // Ask the content script to open the in-page options modal
        chrome.tabs.sendMessage(tab.id, { action: "OPEN_OPTIONS_MODAL", reason: 'missing_api_key' });
      }
      return;
    }

    // 3. Call Groq and handle errors gracefully
    try {
      const response = await callGroq(data, selectedText);
      if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { action: "DISPLAY_ANSWER", text: response });
    } catch (err) {
      const message = err && err.message ? err.message : 'Unknown error';
      if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { action: "DISPLAY_ERROR", text: `Error: ${message}` });
    }
  }
});

async function callGroq(settings, context) {
  const systemPrompt = `
You are LUMINA, a helpful browser assistant.

Rules:
- Use ONLY the information explicitly provided by the user.
- If the context is a title or topic, explain it clearly and concisely.
- Be concise, clear, and accurate.
- Maintain a ${settings.tone || "neutral"} tone.
- If the provided information is insufficient, respond EXACTLY with:
  "Insufficient information to answer."
- Use resume or personal details ONLY if they are clearly relevant.
`;

  const userPrompt = `
Context:
${context}

${settings.resume ? `Resume (use only if relevant):
${settings.resume}` : ""}

Formatting:
- Structure the response using clear sections when appropriate.
- Use short paragraphs or bullet points for readability.
- Format code using proper markdown code blocks.
- Avoid meta commentary (e.g., "Here is the solution").
- Do not mention prompts, models, or reasoning steps.

Task:
Provide the best possible answer using only the information above.
`;

  let response;
  try {
    const controller = new AbortController();
    const timeoutMs = 15000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 512
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw new Error("Network error while calling Groq");
  }

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) throw new Error("Invalid API key");
    if (response.status === 429) throw new Error("Rate limit exceeded");
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (!data?.choices?.[0]?.message?.content) {
    throw new Error("Malformed response from Groq");
  }

  return data.choices[0].message.content.trim();
}
