# JARVIS 2.0
### Just A Rather Very Intelligent System


A full-stack AI assistant web app and Windows desktop app built with Next.js 15, TypeScript, and Tauri v2. Inspired by Tony Stark's JARVIS with an Iron Man glassmorphism HUD aesthetic.

🌐 **Live Demo:** [vyxorix-jarvis.vercel.app](https://vyxorix-jarvis.vercel.app)

---

## Features

- 🤖 **AI Chat** — Streaming responses via OpenRouter (Claude, Llama, Gemini and more)
- 🎤 **Voice Input** — Web Speech API for hands-free commands
- 🔊 **Voice Output** — Text-to-speech so JARVIS actually talks back
- 🔍 **Web Search** — Real-time search via Tavily API
- 📁 **File Analysis** — Drop images or PDFs and JARVIS reads them
- 🧠 **Memory** — Chat history persisted via localStorage (browser) and Documents folder (desktop app)
- 🔐 **Auth** — Username + password login with SHA256 hashing
- 🖥️ **Windows App** — Native desktop app via Tauri v2 with no devtools/inspect
- 🌐 **Web Version** — Deployed on Vercel, works on any browser
- 🇮🇳 **Hindi Support** — Toggle between English and Hindi voice input/output

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| AI | OpenRouter API (free models supported) |
| Voice | Web Speech API + SpeechSynthesis API |
| Search | Tavily API |
| Vision | OpenRouter vision models |
| Auth | SHA256 via Web Crypto API |
| Desktop | Tauri v2 + Rust |
| Deploy | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Rust + Cargo (for desktop app only)
- Microsoft C++ Build Tools (for desktop app only)

### 1. Clone the repo
```bash
git clone https://github.com/joshinarayan/Jarvis-2.0
cd Jarvis-2.0
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root:
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=openrouter/free
OPENROUTER_VISION_MODEL=openrouter/free
TAVILY_API_KEY=tvly-your-key-here
```

Get your free keys:
- OpenRouter → [openrouter.ai](https://openrouter.ai)
- Tavily → [tavily.com](https://tavily.com)

### 4. Run web version
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in Chrome.

### 5. Run desktop app (Windows)
```bash
npx tauri dev
```

### 6. Build Windows installer
```bash
npx tauri build
```
Installer output: `src-tauri/target/release/bundle/msi/`

---

## Project Structure

```
jarvis-2.0/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # OpenRouter streaming
│   │   ├── search/route.ts     # Tavily web search
│   │   └── analyze/route.ts    # Vision/file analysis
│   ├── login/page.tsx          # Auth page
│   ├── page.tsx                # Main JARVIS HUD
│   ├── globals.css             # Iron Man theme
│   └── layout.tsx
├── components/
│   └── FileUpload.tsx          # Drag & drop file upload
├── hooks/
│   ├── useChat.ts              # Chat + streaming logic
│   ├── useVoice.ts             # Voice input/output
│   └── useFileUpload.ts        # File processing
├── lib/
│   ├── openrouter.ts           # OpenRouter client
│   ├── searchTool.ts           # Tavily search helper
│   ├── fileUtils.ts            # File processing utils
│   └── tauriStorage.ts         # Desktop file storage
└── src-tauri/                  # Tauri desktop app
    ├── src/main.rs
    └── tauri.conf.json
```

---

## Free Models on OpenRouter

| Model | Quality | Free? |
|---|---|---|
| `openrouter/free` | Auto-picks best | ✅ Yes |
| `meta-llama/llama-3.3-70b-instruct:free` | Great | ✅ Yes |
| `google/gemini-flash-1.5:free` | Fast | ✅ Yes |
| `anthropic/claude-sonnet-4-5` | Best | 💰 Paid |

---

## Desktop App Features

When running as a Windows app via Tauri:
- ✅ No right-click context menu
- ✅ No F12 devtools
- ✅ No Ctrl+U view source
- ✅ Chat saved to `Documents/JARVIS/chat_history.json`
- ✅ Auth saved to `Documents/JARVIS/auth.json`
- ✅ Transparent frameless window

---

## Screenshots

> Iron Man themed glassmorphism HUD with arc reactor, real-time chat streaming, voice controls, and system status panels.

---

## Built By

**Dream (Vyxorix)** — Self-taught developer, 12th grade

- GitHub: [@joshinarayan](https://github.com/joshinarayan)
- Web: [vyxorix-jarvis.vercel.app](https://vyxorix-jarvis.vercel.app)

---

## License

MIT — do whatever you want with it . 🤖

---

> *"I am JARVIS. Just A Rather Very Intelligent System. How may I assist you today?"*
