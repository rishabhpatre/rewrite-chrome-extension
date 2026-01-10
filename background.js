// Background script

// Listener for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generate_text") {
    handleGeneration(request, sendResponse);
    return true; // Will respond asynchronously
  }
});

async function handleGeneration(request, sendResponse) {
  // Fetch Config (Keys + Prompts + Style)
  const config = await chrome.storage.sync.get([
    "selectedProvider", "geminiApiKey", "openaiApiKey",
    "languageLevel",
    "customPrompt1", "customPrompt2", "customPrompt3"
  ]);

  try {
    const { type, text } = request;

    // Determine Style Instruction
    const level = config.languageLevel || 'neutral';
    let styleInstruction = "";
    if (level === 'simple') {
      styleInstruction = "STYLE: Use simple, commonly used language. Prefer short sentences. Avoid uncommon or academic words.";
    } else if (level === 'professional') {
      styleInstruction = "STYLE: Use professional, polished language without sounding formal, verbose, or academic.";
    } else {
      styleInstruction = "STYLE: Use clear, natural, modern language.";
    }

    let prompt = "";
    // Helper to prepend style
    const withStyle = (p) => `${styleInstruction}\n\n${p}`;

    if (type === "rewrite") {
      prompt = withStyle(`You are a professional editor. Rewrite the text to:\n- Fix grammar, spelling, and punctuation\n- Improve sentence structure and clarity\n- Preserve the original tone, intent, and meaning\n- Do NOT add new information\n- Do NOT remove important details\n- Do NOT change writing style (formal stays formal, casual stays casual)\n\nIf the text is already clear and correct, return it unchanged.\n\nIMPORTANT: Provide ONLY the rewritten text as output. Do not include any introductory or concluding remarks (like "Here is the text"). Do not use markdown formatting (no bold, italics, headers, etc). Use only simple punctuation (comma, full stop, colon, semicolon). Text:\n\n${text}`);
    } else if (type === "summarize") {
      prompt = withStyle(`You are an AI assistant that summarizes content accurately.\n\nSummarize the provided text by:\n- Capturing the main ideas and key points\n- Preserving the original meaning and intent\n- Using clear, concise language\n- Avoiding unnecessary details or examples\n- Not adding any information that is not in the text\n\nIf the text does not contain enough information, say so clearly.\n\nIMPORTANT: Provide ONLY the summary as output. Do not include any introductory or concluding remarks. Do not use markdown formatting (NO bold **, NO italics *, NO headers). Use only simple punctuation. Text:\n\n${text}`);
    } else if (type === "translate") {
      prompt = withStyle(`You are a professional translator.\n\nTask:\n1. Detect the language of the provided text.\n2. If the text is in English, translate it to Hindi.\n3. If the text is in ANY other language (not English), translate it to English.\n\nIMPORTANT: Provide ONLY the translated text as output. Do not include any introductory or concluding remarks. Do not use markdown formatting. Text:\n\n${text}`);
    } else if (type === "explain") {
      prompt = withStyle(`You are a helpful teacher. Explain the following text (or word) in simple layman terms.\n\n- Keep the explanation short, concise, and easy to understand.\n- If it's a single word, define it and give a brief example if helpful.\n- If it's a phrase, explain its meaning in context.\n\nIMPORTANT: Provide ONLY the explanation as output. Do not include introductory phrases. Do not use markdown formatting. Text:\n\n${text}`);

      // Writing Tools
    } else if (type === "proofread") {
      prompt = withStyle(`You are a professional editor. Proofread the text for grammar, spelling, and punctuation errors ONLY. Do not change the style or tone. Return the corrected text only. Do NOT use markdown bold/italics.\n\nText:\n${text}`);
    } else if (type === "key_points") {
      prompt = withStyle(`Extract the key points from the text as concise bullet points. Use the author's wording where possible. Do not add new information. If no clear key points exist, say so. Do NOT use markdown bold/italics.\n\nText:\n${text}`);
    } else if (type === "action_items") {
      prompt = withStyle(`Extract clear action items from the text. Write each action as a short imperative sentence. Do not infer or add tasks. If no action items are present, say "No action items found." Do NOT use markdown bold/italics.\n\nText:\n${text}`);
    } else if (type === "simplify") {
      // Simplify already enforces simple language, but reinforcing it is fine.
      prompt = withStyle(`Simplify the text using clear, commonly used language.\n\nRewrite the text so that:\n- The meaning and intent remain exactly the same\n- Sentences are shorter and easier to read\n- Complex or uncommon words are replaced with simple, everyday language\n- The tone remains neutral and natural\n- No information is added or removed\n\nIf the text is already simple and clear, return it unchanged.\n\nText:\n${text}`);

      // Platform Tools 
    } else if (type === "email") {
      prompt = withStyle(`Write a clear, well-structured email based on the text. Preserve the original intent and tone. Improve grammar, clarity, and flow without adding new information. Do NOT use markdown bold/italics.\n\nText:\n${text}`);
    } else if (type === "whatsapp") {
      prompt = withStyle(`Rewrite the text as a WhatsApp message. Keep it short, conversational, and natural. Preserve the original tone and intent. Avoid formal language unless present in the text. Do NOT use markdown bold/italics (* or **).\n\nText:\n${text}`);
    } else if (type === "tweet") {
      prompt = withStyle(`Write a single tweet (max 280 characters) that captures the core idea of the text. Preserve the original tone and do not add new information. Do NOT use markdown bold/italics.\n\nText:\n${text}`);

      // Project Tools (Jira/Agile)
    } else if (type === "bug") {
      prompt = withStyle(`Convert the text into a JIRA bug ticket with a clear title, description, steps to reproduce, expected result, and actual result. Use only the information provided. If details are missing, write "Not provided". Do NOT use markdown bold ** or italics *.\n\nText:\n${text}`);
    } else if (type === "story") {
      prompt = withStyle(`Convert the text into a JIRA user story using the format: As a <user>, I want <goal>, so that <benefit>. Include acceptance criteria as bullet points. Use only the information provided. Do NOT use markdown bold ** or italics *.\n\nFormat:\nProblem Statement: [Briefly describe the problem being solved]\n\nStory: As a [persona], I want [feature] so that [benefit].\n\nAcceptance Criteria:\n- [ ] Criteria 1\n- [ ] Criteria 2\n- [ ] Criteria 3\n\nNotes: [Additional context]\n\nText:\n${text}`);
    } else if (type === "task") {
      prompt = withStyle(`Convert the text into a JIRA task with a clear title, description, and bullet-pointed subtasks if applicable. Do not include user story or bug language. Use only the information provided. Do NOT use markdown bold ** or italics *.\n\nText:\n${text}`);

      // Custom Tool
    } else if (type === "smart_reply") {
      prompt = withStyle(`You are writing a high-quality reply to a public post meant to stand out.\n\nRead the post below and write a concise reply that:\n- Takes a clear stance: appreciation, constructive critique, thoughtful counterpoint, or a meaningful question\n- Adds a new perspective instead of summarizing the post\n- Does NOT restate or paraphrase the post\n- Is concise (1–2 sentences max)\n- Sounds confident, natural, and professional\n- Feels like it was written by a real person, not an AI\n- Avoids emojis and hashtags\n\nIf possible, include a subtle insight or implication that invites discussion.\n\nReturn only the reply text.\n\nPost:\n${text}`);
    } else if (type === "appreciate") {
      prompt = withStyle(`You are writing a thoughtful appreciation reply to a public post.\n\nRead the post below and write a concise reply that:\n- Clearly appreciates or agrees with the idea\n- Adds a meaningful insight or extension of the thought\n- Avoids generic praise\n- Does NOT summarize or restate the post\n- Is concise (1–2 sentences max)\n- Sounds confident, professional, and human\n- Avoids emojis and hashtags\n\nReturn only the reply text.\n\nPost:\n${text}`);
    } else if (type === "critique") {
      prompt = withStyle(`You are writing a constructive critique to a public post.\n\nRead the post below and write a concise reply that:\n- Acknowledges the core idea but challenges a limitation, assumption, or missing nuance\n- Is respectful and professional, not confrontational\n- Adds a thoughtful perspective rather than summarizing\n- Does NOT restate or paraphrase the post\n- Is concise (1–2 sentences max)\n- Sounds balanced, confident, and human\n- Avoids emojis and hashtags\n\nReturn only the reply text.\n\nPost:\n${text}`);
    } else if (type === "counter") {
      prompt = withStyle(`You are writing a counterpoint to a public post.\n\nRead the post below and write a concise reply that:\n- Presents a clear alternative or opposing perspective\n- Is confident but respectful\n- Introduces a new way of thinking\n- Does NOT summarize or restate the post\n- Is concise (1–2 sentences max)\n- Sounds thoughtful, intelligent, and human\n- Avoids emojis and hashtags\n\nReturn only the reply text.\n\nPost:\n${text}`);
    } else if (type === "question") {
      prompt = withStyle(`You are writing a thoughtful question in response to a public post.\n\nRead the post below and write a concise reply that:\n- Asks one insightful, non-obvious question\n- Is inspired by the implications or assumptions of the post\n- Does NOT summarize or restate the post\n- Encourages discussion or deeper thinking\n- Is concise (1 sentence preferred, max 2)\n- Sounds curious, natural, and professional\n- Avoids emojis and hashtags\n\nReturn only the question text.\n\nPost:\n${text}`);
    } else if (type === "empathise") {
      prompt = withStyle(`You are writing an empathetic reply to a public post.\n\nRead the post below and write a concise reply that:\n- Acknowledges the emotion, experience, or challenge expressed\n- Shows understanding without giving advice or solutions\n- Avoids clichés and platitudes\n- Does NOT summarize or restate the post\n- Is concise (1–2 sentences max)\n- Sounds genuine, respectful, and human\n- Avoids emojis and hashtags\n\nReturn only the reply text.\n\nPost:\n${text}`);
    } else if (type === "reject") {
      prompt = withStyle(`You are writing a polite rejection reply to a public post.\n\nRead the post below and write a concise reply that:\n- Clearly but respectfully disagrees or declines the idea\n- Maintains a calm, professional, non-confrontational tone\n- Does NOT attack the author or their intent\n- Does NOT summarize or restate the post\n- Is concise (1–2 sentences max)\n- Sounds composed, thoughtful, and human\n- Avoids emojis and hashtags\n\nReturn only the reply text.\n\nPost:\n${text}`);
    } else if (type === "accept") {
      prompt = withStyle(`You are writing a positive acceptance reply to a public post.\n\nRead the post below and write a concise reply that:\n- Clearly expresses agreement or acceptance\n- Signals alignment or willingness to move forward\n- Adds a small positive or forward-looking note\n- Does NOT summarize or paraphrase the post\n- Is concise (1–2 sentences max)\n- Sounds confident, constructive, and human\n- Avoids emojis and hashtags\n\nReturn only the reply text.\n\nPost:\n${text}`);
    } else if (type === "custom1" || type === "custom2" || type === "custom3") {
      let customPrompt = "";
      if (type === "custom1") customPrompt = config.customPrompt1;
      if (type === "custom2") customPrompt = config.customPrompt2;
      if (type === "custom3") customPrompt = config.customPrompt3;

      if (!customPrompt || customPrompt.trim() === "") {
        return { error: `Custom Prompt for ${type.replace('custom', 'Tool ')} not set. Please Configure Options.` };
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

    // --- API Call ---
    const provider = config.selectedProvider || 'gemini';
    let result = "";

    if (provider === 'openai') {
      const apiKey = config.openaiApiKey;
      if (!apiKey) {
        sendResponse({ error: "OpenAI API Key is missing. Please set it in Options." });
        return;
      }
      result = await callOpenAI(apiKey, prompt);
    } else {
      // Default to Gemini
      const apiKey = config.geminiApiKey;
      if (!apiKey) {
        sendResponse({ error: "Gemini API Key is missing. Please set it in Options." });
        return;
      }
      result = await callGemini(apiKey, prompt);
    }

    sendResponse({ success: true, data: result });

  } catch (error) {
    console.error("Error:", error);
    sendResponse({ error: error.message || "An error occurred." });
  }
}

// --- API Helpers ---

async function callOpenAI(apiKey, userPrompt) {
  const url = "https://api.openai.com/v1/chat/completions";

  // System instruction is implicit in prompt for now, or we can use "system" role if we structure it.
  // Our prompts are currently single-string "Instruction + Text". 
  // We'll send it as a User message, effectively fine.

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Cost effective, fast, smart
      messages: [
        { role: "system", content: "You are a helpful AI writing assistant. Output plain text only. no markdown." },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI API Error");
  }

  return data.choices[0].message.content.trim();
}

async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini API Error");
  }

  return data.candidates[0].content.parts[0].text.trim();
}
