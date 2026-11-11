# aptus-ai-chatbot-widget

[![npm version](https://img.shields.io/npm/v/aptus-ai-chatbot-widget.svg?style=flat-square&color=FF4D00)](https://www.npmjs.com/package/aptus-ai-chatbot-widget)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE)

React chatbot widget for Aptus AI. Drop it on a site with a business `token` and `apiUrl`. Theme, name, welcome message, and avatar sync from the Aptus dashboard. The widget does not call LLM providers directly; chat and STT go through your Aptus backend.

**npm:** https://www.npmjs.com/package/aptus-ai-chatbot-widget  
**Platform repo:** https://github.com/hashirsajid58200p/aptus-ai-full-stack  
**Live platform:** https://aptus-ai.vercel.app

Current version: **1.0.17**

---

## Install

```bash
npm install aptus-ai-chatbot-widget
# or: pnpm add aptus-ai-chatbot-widget / yarn add aptus-ai-chatbot-widget
```

Peer dependencies: `react`, `react-dom`, `styled-components`.

---

## Quick start

```jsx
import { ChatBot } from 'aptus-ai-chatbot-widget';

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <ChatBot
        token="YOUR_BUSINESS_TOKEN"
        apiUrl="https://your-api.domain.com/api/v1"
        theme="aptus"
        wantToShowSuggestions={true}
      />
    </div>
  );
}
```

For Next.js App Router, load the widget from a client component (`"use client"`) or `dynamic(..., { ssr: false })` so `window` / `localStorage` stay browser-only.

Env fallbacks (optional): `NEXT_PUBLIC_APTUS_TOKEN`, `NEXT_PUBLIC_APTUS_API_URL`.

---

## Themes (`theme` prop)

| Theme | Notes |
|-------|--------|
| `aptus` (default) | Burnt orange neo-brutalist |
| `boty` | Beige / forest green |
| `chatgpt` | Charcoal + emerald |
| `compute` | Dark terminal / cyan |
| `crosshaven` | Navy editorial |
| `studio` | Dark + yellow |
| `energy` | Violet + lime |
| `smarthome` | Emerald / cyan |
| `superdesign` | Pastel violet |
| `professional` | Corporate blue |
| `github` | Dimmed slate |
| `dracula` | Purple syntax look |
| `nord` | Frost blue |
| `cyberpunk` | Neon yellow / cyan |

Dashboard colors and `borderRadius` override the preset when set.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `token` | `string` | required | Business chatbot token from the Aptus dashboard |
| `apiUrl` | `string` | required | Backend base, e.g. `https://host/api/v1` |
| `theme` | `string` | `aptus` | Built-in theme name |
| `botName` | `string` | from dashboard | Header title |
| `welcomeMessage` | `string` | from dashboard | First bot bubble |
| `position` | `'left'` \| `'right'` | `right` | Launcher side |
| `borderRadius` | `string` \| `number` | theme | Window / bubbles |
| `toggleBtnRadius` | `string` \| `number` | theme | Launcher button |
| `toggleBtnColor` | `string` | theme | Launcher icon color |
| `toggleBtnBgColor` | `string` | theme | Launcher background |
| `wantToShowSuggestions` | `boolean` | `false` | FAQ suggestion chips |

---

## Backend endpoints used

- `GET /user/token/verify`: config bootstrap (`x-chatbot-token` header)
- `POST /session/create`, `GET /session/messages`, `POST /session/request-human`
- `POST /chatbot/getResponse`, `POST /chatbot/generate`, `POST /chatbot/transcribe`

---

## Security notes

- Keep the chatbot token as a public embed token; protect provider API keys on the server only.
- Set allowed domains in the Aptus dashboard so other origins cannot use the token.
- Traffic stays between the visitor browser and your `apiUrl`.

---

## License

[MIT](./LICENSE) © Hashir Sajid (Aptus AI)
