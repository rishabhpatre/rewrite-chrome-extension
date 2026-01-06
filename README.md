# Rewrite & Summarize - Chrome Extension

A powerful, modern Chrome Extension that brings AI-powered text editing to any webpage. Built with Google's Gemini API.

![Logo](icons/icon128.png)

## Features

-   **🖊️ Rewrite**: Professional editing to fix grammar, improve flow, and enhance tone.
-   **📝 Summarize**: Get concise summaries of long articles or text blocks.
-   **文 Translate**: Instantly translate English to Hindi and other languages to English.
-   **modern UI**: Sleek dark-mode interface with a premium floating toolbar.
-   **📋 One-Click Copy**: Easily copy results to your clipboard.
-   **Secure**: Bring your own API Key (BYOK) architecture – no data stored on our servers.

## Installation

### Manual Installation (Developer Mode)
1.  Clone this repository or download the ZIP.
2.  Open Chrome and go to `chrome://extensions`.
3.  Enable **Developer mode** (top right).
4.  Click **Load unpacked** and select the project folder.
5.  Right-click the extension icon -> **Options** -> Enter your Gemini API Key.

## Tech Stack
-   **Frontend**: Vanilla JavaScript, HTML5, CSS3 (Modern Glassmorphism/Dark UI).
-   **Backend**: Chrome Extension V3 Manifest, Google Gemini API.

## Privacy
This extension processes text only when you explicitly click a button. Data is sent directly to the Google Gemini API for processing. Your API key is stored locally in your browser (`chrome.storage.sync`) and is never shared.
