// Background script

// Listener for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generate_text") {
    handleGeneration(request).then(response => {
      sendResponse(response);
    });
    return true; // Will respond asynchronously
  }
});

async function handleGeneration(request) {
  try {
    const { type, text } = request;
    // Retrieve API key from storage
    const data = await chrome.storage.sync.get("geminiApiKey");
    const apiKey = data.geminiApiKey;

    if (!apiKey) {
      return { error: "API Key not set. Please right-click the extension icon > Options to set your Gemini API Key." };
    }

    let prompt;
    if (type === "rewrite") {
      prompt = `You are a professional editor. Rewrite the text to:\n- Fix grammar, spelling, and punctuation\n- Improve sentence structure and clarity\n- Preserve the original tone, intent, and meaning\n- Do NOT add new information\n- Do NOT remove important details\n- Do NOT change writing style (formal stays formal, casual stays casual)\n\nIf the text is already clear and correct, return it unchanged.\n\nIMPORTANT: Provide ONLY the rewritten text as output. Do not include any introductory or concluding remarks (like "Here is the text"). Do not use markdown formatting (no bold, italics, headers, etc). Use only simple punctuation (comma, full stop, colon, semicolon). Text:\n\n${text}`;
    } else if (type === "summarize") {
      prompt = `You are an AI assistant that summarizes content accurately.\n\nSummarize the provided text by:\n- Capturing the main ideas and key points\n- Preserving the original meaning and intent\n- Using clear, concise language\n- Avoiding unnecessary details or examples\n- Not adding any information that is not in the text\n\nIf the text does not contain enough information, say so clearly.\n\nIMPORTANT: Provide ONLY the summary as output. Do not include any introductory or concluding remarks. Do not use markdown formatting. Use only simple punctuation. Text:\n\n${text}`;
    } else if (type === "translate") {
      prompt = `You are a professional translator.\n\nTask:\n1. Detect the language of the provided text.\n2. If the text is in English, translate it to Hindi.\n3. If the text is in ANY other language (not English), translate it to English.\n\nIMPORTANT: Provide ONLY the translated text as output. Do not include any introductory or concluding remarks (like "Here is the translation" or "Detected language: ..."). Do not use markdown formatting. Use only simple punctuation. Text:\n\n${text}`;
    }

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: `API Error: ${response.status} - ${errorText}` };
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (generatedText) {
      return { success: true, data: generatedText };
    } else {
      return { error: "No response from AI." };
    }

  } catch (err) {
    return { error: err.message };
  }
}
