# Draftly - AI Writing Copilot

**Draftly** is the ultimate AI writing copilot for Chrome. Select any text on the web to Rewrite, Reply, Translate, or generate professional content instantly using **Google Gemini** or **OpenAI (ChatGPT)**.

![Logo](icons/icon128.png)

## ✨ Features

### ⚡ Core Actions
- **🖊️ Rewrite**: Fix grammar, improve flow, and enhance tone.
- **📝 Summarize**: Concise summaries of long articles.
- **文 Translate**: Smart translation into English or Hindi.
- **💡 Explain**: Simple layman's explanations for complex terms.

### 💬 Reply Tools (New!)
*Perfect for LinkedIn, Twitter, and Email.*
- **🚀 Smart Reply**: Context-aware high-quality replies.
- **🔥 Roast**: Witty, playful roasts (use responsibly!).
- **❤️ Appreciate**: Thoughtful appreciation messages.
- **🤔 Question**: Ask insightful follow-up questions.
- **🤝 Accept/Reject**: Polite professional responses and more.

### 🌍 Language Level Control (New!)
Customize the tone of *every* output globally:
- **Simple**: Everyday language, short sentences.
- **Neutral**: Standard, clear communication (Default).
- **Professional**: Polished, corporate-ready tone.

### 🛠️ Writing Tools
- **✅ Proofread**: Fix grammar/spelling instantly.
- **✂️ Simplify**: Make complex text easy to understand.
- **🔑 Key Points**: Extract bullet points.
- **📋 Action Items**: Identify tasks and to-dos.

### 🚀 Project Management
- **🐞 Bug Report**: Auto-format Selection into a Jira Bug.
- **📖 User Story**: Generate Agile User Stories.
- **⚙️ Task**: Create technical task descriptions.

### 🌟 Power User Features
- **🤖 Multi-LLM Support**: Choose between **Google Gemini** (Free Tier) or **OpenAI** (ChatGPT).
- **✨ 3 Custom Tools**: Define your own AI prompts (e.g., "Roast this", "Explain to 5yo").
- **📊 Dashboard UI**: A beautiful 3-column dashboard for quick access.
- **🔒 Secure (BYOK)**: Bring Your Own Key. Your keys are stored locally; no data touches our servers.

## Installation

### Manual Installation (Developer Mode)
1. Clone this repository or download the ZIP.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. Right-click the extension icon -> **Options** -> Select Provider -> Enter API Key.

## Tech Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Modern Glassmorphism/Dark UI).
- **Backend**: Chrome Extension V3 Manifest, Google Gemini API, OpenAI API.

## Privacy
This extension processes text only when you explicitly click a button. Data is sent directly to the AI provider (Google or OpenAI) for processing. Your keys are stored locally (`chrome.storage.sync`) and are never shared.

## Screenshots
![Draftly Demo](screenshots/demo.png)




