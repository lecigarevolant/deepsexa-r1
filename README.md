# 💬 Exa & Deepseek R1 1776 Chat App
### Powered by [Exa](https://exa.ai) - The Web Search API


## 🎯 What is Deepsexa?

Deepsexa is a free and open-source chat app that uses Exa's API for web search and (Deepseek) R1 1776 LLM for reasoning.

<br>

## 🇨🇳 What is R1-1776? 

[Perplexity](https://www.perplexity.ai/hub/blog/open-sourcing-r1-1776) have open-sourced r1-1776, which is simply deepseek-r1 with the CCP censorship scrubbed out. Not only is this much more palatable in itself, at time of creation they offer the most reliable API that is serving R1 of any kind. 

[Exa](https://exa.ai) are killing it and I couldn't live without the original so I forked, swapped in r1-1776, and gave it a silly name. Definitely would like to build upon the combo, so stay tuned or beat me to it! 

For now this app provides a cool and simple chat experience which you can clone and build upon.

<br>

## 💻 Tech Stack
- **Search Engine**: [Exa API](https://exa.ai) - Web search API
- **Language Model**:  R1-1776 via Perplexity
- **Frontend**: [Next.js](https://nextjs.org/docs) with App Router, [TailwindCSS](https://tailwindcss.com), TypeScript
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/docs/ai-sdk-core)

<br>

## 🚀 Getting Started

### Prerequisites
- Node.js
- Exa API key
- Perplexity API key (For Deepseek R1)

### Installation

1. Clone the repository
```bash
git clone https://github.com/exa-labs/exa-deepseek-chat.git
cd exa-deepseek-chat
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (for Exa and Perplexity)

4. Run the development server
```bash
npm run dev
```

5. Open http://localhost:3000/deepsexa in your browser

<br>

## 🔑 API Keys & Environment Setup

### Required API Keys
* **Exa API Key**: Get from [Exa Dashboard](https://dashboard.exa.ai/api-keys)
* **Perplexity API Key**: Get from your [Perplexity Dashboard](https://www.perplexity.ai/settings/api)

<br>

## ⭐ About [Exa](https://exa.ai)

This project is powered by [Exa.ai](https://exa.ai), a web search API designed specifically for AI applications. Exa provides:

* Quickly finds up-to-date information from the web
* Improves the accuracy of answers by real-time web search
* Uses high reasoning LLM to provide accurate answers

[Try the New Exa Websets](https://exa.ai/websets)

<br>

---

(Mostly) Built with ❤️ by the Exa team 
