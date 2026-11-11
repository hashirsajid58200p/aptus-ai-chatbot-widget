# Aptus AI Chatbot Widget (`aptus-ai-chatbot-widget`)

[![npm version](https://img.shields.io/npm/v/aptus-ai-chatbot-widget.svg?style=flat-square&color=FF4D00)](https://www.npmjs.com/package/aptus-ai-chatbot-widget)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A customizable, themeable, secure, and responsive React AI chatbot widget (`aptus-ai-chatbot-widget`). Drop a high-performance, grounded AI customer support agent onto any website by passing your unique business token and API endpoint.

---

## ✨ Key Capabilities

- **Zero-Config Remote Synchronization**: Bot name, theme, custom colors, avatars, and greetings auto-sync directly from your Aptus AI dashboard portal.
- **Full GitHub Flavored Markdown (GFM)**: Bot responses render formatted headings, code blocks with syntax languages, multi-column tables, task lists, blockquotes, bold, italics, and links.
- **Real-Time Streaming Voice AI**: Hands-free voice recognition with live interim results via the browser Web Speech API paired with Groq Whisper Large v3 Turbo server-side fallback.
- **Live Human Agent Takeover**: Switch seamlessly between automated AI grounding and live support agents in real time.
- **Zero Hallucination Grounding**: Answers queries strictly from your verified business FAQs and Markdown documentation.
- **Origin Domain Security**: Token verification and domain whitelisting to protect against unauthorized scraping and hotlinking.

---

## 📦 Installation

```bash
# Using npm
npm install aptus-ai-chatbot-widget

# Using pnpm
pnpm add aptus-ai-chatbot-widget

# Using yarn
yarn add aptus-ai-chatbot-widget
```

---

## 🚀 Quick Start (React / Next.js)

```jsx
import React from 'react';
import { ChatBot } from 'aptus-ai-chatbot-widget';

export default function Layout({ children }) {
  return (
    <div>
      {children}

      <ChatBot 
        token="YOUR_BUSINESS_TOKEN" 
        apiUrl="https://your-api-domain.com/api/v1"
        theme="aptus"
        wantToShowSuggestions={true}
      />
    </div>
  );
}
```

---

## 🎨 Built-in Theme Presets (`theme` prop)

Pass any theme preset into the `theme` prop to match your visual aesthetic:

| Theme Name | Design Style | Target Use-Case |
|------------|--------------|-----------------|
| `"aptus"` *(Default)* | Neo-Brutalist: Burnt Orange (`#FF4D00`), Cream (`#FDF9F0`), 3px dark borders & hard shadows | AI SaaS, Neo-Brutalist & Tech brands |
| `"boty"` | Natural & Organic: Warm Beige, Forest Green (`#4F5B3A`), Sand | Skincare, Wellness, E-Commerce |
| `"chatgpt"` | Clean Charcoal Dark Mode (`#212121`), Emerald Green (`#10A37F`) | SaaS, Minimalist Developer Platforms |
| `"compute"` | Cyber Terminal: Monospace font, Jet Black (`#0C0E12`), Electric Blue | Cloud Infrastructure, Developer Tools |
| `"crosshaven"` | Editorial Luxury: Refined navy slate and clean royal blue contrast (`#2563EB`) | B2B, Finance, Legal, Consulting |
| `"studio"` | Dark Studio: Monochrome obsidian with electric yellow (`#FFD600`) | Audio, Media, Creative Studios |
| `"energy"` | Neon Energy: Vibrant violet and high-impact lime punch (`#A3E635`) | Fitness, Sports, Dynamic Startups |
| `"smarthome"` | Emerald Cyan: Soft aqua cyan with modern smooth curves (`#0EA5E9`) | IoT, Smart Living, Health |
| `"superdesign"` | Pastel Violet: Deep violet header with soft purple canvas (`#8B5CF6`) | Design Agencies, Portfolios |
| `"professional"` | Corporate Blue: Enterprise royal blue and crisp white card (`#1D4ED8`) | Enterprise, HR, Healthcare |
| `"github"` | GitHub Dimmed: Developer-focused dark slate theme (`#30363D`) | Open Source, Dev Portals |
| `"dracula"` | Dracula Purple: Classic dark purple syntax aesthetic (`#BD93F9`) | Developer Tools, Tech Blogs |
| `"nord"` | Nordic Frost: Arctic cold ice blue with muted dark grays (`#88C0D0`) | Scandinavian, Clean Tech, SaaS |
| `"cyberpunk"` | High-voltage neon yellow (`#FCEE09`), Cyan, sharp edges | Web3, Gaming, Interactive Brands |

---

## 🛠️ Complete Props Reference

| Prop Name | Type | Default | Description |
|-----------|------|---------|-------------|
| `token` | `string` | **(Required)** | Unique business authentication token from your dashboard. |
| `apiUrl` | `string` | **(Required)** | Backend API endpoint URL for processing chat sessions and messages. |
| `theme` | `string` | `"aptus"` | Select one of the built-in theme presets. |
| `botName` | `string` | *Dashboard* | Custom chatbot display name in the header. |
| `welcomeMessage` | `string` | *Dashboard* | Initial greeting bubble displayed on launch. |
| `position` | `'left'` \| `'right'` | `'right'` | Floating widget placement on the screen. |
| `borderRadius` | `string` \| `number` | *Theme Default* | Custom border radius for window, input, and bubbles (e.g., `'0px'`, `'12px'`, `'24px'`). |
| `toggleBtnRadius` | `string` \| `number` | *Theme Default* | Custom border radius for the floating launcher button. |
| `toggleBtnColor` | `string` | *Theme Default* | Custom icon color of the floating launcher button. |
| `toggleBtnBgColor` | `string` | *Theme Default* | Custom background color of the floating launcher button. |
| `wantToShowSuggestions` | `boolean` | `false` | Displays clickable FAQ suggestion chips. |

---

## 🔒 Security & Privacy

- **Direct Secure Transmission**: All session details and messages travel exclusively between your website and your configured `apiUrl`. No third-party data collection.
- **Domain Whitelisting**: Set allowed origins in your dashboard to prevent unauthorized hotlinking.
- **Zero Asset Dependencies**: Single-color inline vector SVGs without loose image dependencies for 100% reliable icon rendering.

---

## 📄 License

Distributed under the **MIT License**.
