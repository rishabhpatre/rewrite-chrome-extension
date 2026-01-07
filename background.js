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
    const data = await chrome.storage.sync.get(["geminiApiKey", "customPrompt"]);
    const apiKey = data.geminiApiKey;

    if (!apiKey) {
      return { error: "API Key not set. Please right-click the extension icon > Options to set your Gemini API Key." };
    }

    let prompt;
    if (type === "rewrite") {
      prompt = `You are a professional editor. Rewrite the text to:\n- Fix grammar, spelling, and punctuation\n- Improve sentence structure and clarity\n- Preserve the original tone, intent, and meaning\n- Do NOT add new information\n- Do NOT remove important details\n- Do NOT change writing style (formal stays formal, casual stays casual)\n\nIf the text is already clear and correct, return it unchanged.\n\nIMPORTANT: Provide ONLY the rewritten text as output. Do not include any introductory or concluding remarks (like "Here is the text"). Do not use markdown formatting (no bold, italics, headers, etc). Use only simple punctuation (comma, full stop, colon, semicolon). Text:\n\n${text}`;
    } else if (type === "summarize") {
      prompt = `You are an AI assistant that summarizes content accurately.\n\nSummarize the provided text by:\n- Capturing the main ideas and key points\n- Preserving the original meaning and intent\n- Using clear, concise language\n- Avoiding unnecessary details or examples\n- Not adding any information that is not in the text\n\nIf the text does not contain enough information, say so clearly.\n\nIMPORTANT: Provide ONLY the summary as output. Do not include any introductory or concluding remarks. Do not use markdown formatting (NO bold **, NO italics *, NO headers). Use only simple punctuation. Text:\n\n${text}`;
    } else if (type === "translate") {
      prompt = `You are a professional translator.\n\nTask:\n1. Detect the language of the provided text.\n2. If the text is in English, translate it to Hindi.\n3. If the text is in ANY other language (not English), translate it to English.\n\nIMPORTANT: Provide ONLY the translated text as output. Do not include any introductory or concluding remarks (like "Here is the translation" or "Detected language: ..."). Do not use markdown formatting (NO bold **, NO italics *, NO headers). Use only simple punctuation. Text:\n\n${text}`;
    } else if (type === "explain") {
      prompt = `You are a helpful teacher. Explain the following text (or word) in simple layman terms.\n\n- Keep the explanation short, concise, and easy to understand.\n- If it's a single word, define it and give a brief example if helpful.\n- If it's a phrase, explain its meaning in context.\n\nIMPORTANT: Provide ONLY the explanation as output. Do not include introductory phrases like "Here is the explanation". Do not use markdown formatting (NO bold **, NO italics *). Text:\n\n${text}`;

      // Writing Tools
    } else if (type === "proofread") {
      prompt = `You are a professional editor. Proofread the text for grammar, spelling, and punctuation errors ONLY. Do not change the style or tone. Return the corrected text only. Do NOT use markdown bold/italics.\n\nText:\n${text}`;
    } else if (type === "key_points") {
      prompt = `Extract the key points from the text as concise bullet points. Use the author's wording where possible. Do not add new information. If no clear key points exist, say so. Do NOT use markdown bold/italics.\n\nText:\n${text}`;
    } else if (type === "action_items") {
      prompt = `Extract clear action items from the text. Write each action as a short imperative sentence. Do not infer or add tasks. If no action items are present, say "No action items found." Do NOT use markdown bold/italics.\n\nText:\n${text}`;

      // Platform Tools 
    } else if (type === "email") {
      prompt = `Write a clear, well-structured email based on the text. Preserve the original intent and tone. Improve grammar, clarity, and flow without adding new information. Do NOT use markdown bold/italics.\n\nText:\n${text}`;
    } else if (type === "whatsapp") {
      prompt = `Rewrite the text as a WhatsApp message. Keep it short, conversational, and natural. Preserve the original tone and intent. Avoid formal language unless present in the text. Do NOT use markdown bold/italics (* or **).\n\nText:\n${text}`;
    } else if (type === "tweet") {
      prompt = `Write a single tweet (max 280 characters) that captures the core idea of the text. Preserve the original tone and do not add new information. Do NOT use markdown bold/italics.\n\nText:\n${text}`;

      // Project Tools (Jira/Agile)
    } else if (type === "bug") {
      prompt = `Convert the text into a JIRA bug ticket with a clear title, description, steps to reproduce, expected result, and actual result. Use only the information provided. If details are missing, write "Not provided". Do NOT use markdown bold ** or italics *.\n\nText:\n${text}`;
    } else if (type === "story") {
      prompt = `Convert the text into a JIRA user story using the format: As a <user>, I want <goal>, so that <benefit>. Include acceptance criteria as bullet points. Use only the information provided. Do NOT use markdown bold ** or italics *.\n\nFormat:\nProblem Statement: [Briefly describe the problem being solved]\n\nStory: As a [persona], I want [feature] so that [benefit].\n\nAcceptance Criteria:\n- [ ] Criteria 1\n- [ ] Criteria 2\n- [ ] Criteria 3\n\nNotes: [Additional context]\n\nText:\n${text}`;
    } else if (type === "task") {
      prompt = `Convert the text into a JIRA task with a clear title, description, and bullet-pointed subtasks if applicable. Do not include user story or bug language. Use only the information provided. Do NOT use markdown bold ** or italics *.\n\nText:\n${text}`;

      // Custom Tool
    } else if (type === "custom") {
      const customPrompt = data.customPrompt;
      if (!customPrompt || customPrompt.trim() === "") {
        return { error: "Custom Prompt not set. Please go to Extension Options to configure it." };
      }
      prompt = `You are a precise AI assistant. Follow the instruction below applied to the text.

Constraints:
1. Output ONLY the result. Do not include "Here is the result" or "Alternative version".
2. Provide ONE single best version. Do NOT provide multiple options.
3. Do NOT use markdown bolding (**text**) or italics. Use plain text only.
4. Do NOT invent information not present in the source text.
5. Stay strictly relevant to the input text.

Instruction: ${customPrompt}

Text:
${text}`;
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
