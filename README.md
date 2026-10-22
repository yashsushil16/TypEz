# TypEz ⚡

> Dual-Engine Text Expansion & Agentic AI Writing Assistant for Google Chrome (Manifest V3)

TypEz bridges the gap between instantaneous local macro expansion and intelligent natural language writing assistance. It monitors active DOM keystrokes in real time and executes transformations right in the active input container.

---

## 🏗️ Architectural Overview

TypEz operates on a **dual-engine** principle:

1. **Local Symbol Engine (`?`)**:
   - Zero-latency local macro substitution (e.g., `?@` → `yash.sushil16@gmail.com`, `?sig` → formatted sign-off).
   - Zero network overhead. Reads from and writes directly to `chrome.storage.local`.
   - Runs 100% offline with zero data leakage.

2. **Agentic AI Engine (`!`)**:
   - Context-aware natural language rewriting and transformations (e.g., `!casual`, `!formal`, `!fix`, `!summarize`, `!expand`).
   - Automatically parses the preceding paragraph context before the trigger.
   - Direct client-to-API integration with **Groq** (`llama-3.3-70b-versatile`) and **Google Gemini** (`gemini-2.0-flash`) using user-provided free-tier keys.
   - Built-in provider fallback: if Groq is temporarily rate-limited, requests fail over automatically to Gemini.

---

## 📁 Repository Structure

```
d:\Typez\
├── extension/                 # Chrome Extension (Manifest V3)
│   ├── public/
│   │   ├── manifest.json      # MV3 extension manifest
│   │   ├── content.js         # DOM keystroke monitor & trigger engine
│   │   └── service-worker.js  # AI API routing & storage orchestration
│   ├── src/
│   │   └── popup/             # React + Vite + Tailwind Configuration Interface
│   │       ├── components/    # Dashboard, CommandManager, AISettings, SyncSettings, About
│   │       ├── hooks/         # useStorage
│   │       ├── styles/        # index.css (warm stone design system)
│   │       ├── App.jsx
│   │       └── main.jsx
│   ├── dist/                  # Compiled production extension bundle
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── website/                   # Showcase Website & Live Simulator
│   ├── index.html             # Landing page with interactive typing playground
│   ├── tos.html               # Terms of Service
│   ├── privacy.html           # GDPR & Chrome Web Store compliant Privacy Policy
│   ├── css/
│   │   └── styles.css         # Custom design system stylesheet
│   └── js/
│       └── main.js            # Live interactive typing simulator
│
└── backend/                   # Optional Cross-Device Sync Server
    ├── models/
    │   └── UserConfig.js      # Mongoose user configuration schema
    ├── routes/
    │   ├── auth.js            # JWT user registration & authentication
    │   └── sync.js            # Push & pull sync endpoints
    ├── server.js              # Express.js server entry point
    ├── .env.example           # MongoDB Atlas & port configuration template
    └── package.json
```

---

## 🎨 Design Philosophy

TypEz adheres to a strictly defined, **subdued and structural** design language:
- **Palette**: Warm stone background (`#F6F5F2`), surface panels (`#EDECEA`), deep charcoal ink (`#1A1917`), and warm terra cotta accent (`#C4563A`).
- **Typography**: Google Fonts `"DM Sans"` for structural headings, `"Sora"` for body copy, and `"JetBrains Mono"` for code and triggers.
- **Rules**: Zero drop shadows, zero harsh gradients, zero glassmorphism, zero floating blobs. Clean 8–14px radii with high legibility.
- **State Feedback**: Skeleton loaders for all asynchronous loading states (no spinning wheel freezes).

---

## 🚀 Quick Start & Installation

### 1. Build the Extension
```bash
cd extension
npm install
npm run build
```
This generates the standalone Chrome extension in `extension/dist/`.

### 2. Load into Google Chrome
1. Navigate to `chrome://extensions/` in Chrome.
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/dist` folder.
5. Pin the **TypEz** icon to your toolbar.

### 3. Add Free API Keys
1. Click the TypEz popup icon.
2. Navigate to **AI Settings** in the sidebar.
3. Paste your free [Groq API Key](https://console.groq.com/keys) or [Gemini API Key](https://aistudio.google.com/app/apikey).
4. Click **Test Connection** to verify.

---

## 🌐 Showcase Website & Live Simulator

To preview the landing page, interactive simulator, and legal policies:
Open `website/index.html` in any browser, or run a local static server:
```bash
npx serve website
```

---

## 🗄️ Optional Sync Backend

To enable cross-device snippet synchronization using MongoDB Atlas:
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your MongoDB Atlas URI:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. In the TypEz popup, go to **Sync Settings**, toggle on sync, and enter your server URL (`http://localhost:5000`).

---

## 🔒 Security & Privacy

- **Zero Keystroke Logging**: The DOM monitor only activates when a trigger prefix (`?` or `!`) is initiated and immediately resets on `Space`, `Enter`, or `Escape`.
- **Direct-to-Provider AI**: No proxy servers inspect your prompts. Requests travel directly from the Chrome background worker to Groq or Google API endpoints.
- **Client Sandbox**: All local snippet definitions and API keys stay on your machine in `chrome.storage.local`.

---

## 📄 License & Authors

Created by **Yash Sushil** (`yash.sushil16@gmail.com`). Licensed under the MIT License.
