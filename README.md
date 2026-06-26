# 🤖 AI Habit Coach

AI Habit Coach is a modern, premium web application designed to help users build positive daily routines and habits using OpenAI's language model. Enter a habit you want to build, and receive personalized coaching, practical tips, and an interactive daily challenge to kickstart your progress.

**Live Demo URL:** [https://conesta.vercel.app](https://conesta.vercel.app)

---

## 🚀 Premium Features

* **Sleek Glassmorphic Design:** A modern dark-mode interface built with radial gradients and backdrop filters for a premium user experience.
* **Semantic Guardrails:** Real-time checking to ensure inputs are safe, positive, and relevant to habit building. Unsafe, offensive, or unrelated inputs are automatically caught and handled with custom user warnings.
* **Character Counter:** Client-side input validation limiting habits to 100 characters, with active color warning as the user approaches the limit.
* **Interactive Challenges:** Celebrate consistency! The "Complete Challenge" interactive button updates the card state and triggers a beautiful particle confetti explosion inside the browser.
* **Secure Architecture:** Built using Vercel Serverless Functions and secure environment variables to ensure API keys are never exposed to the frontend.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Vanilla), ES6+ JavaScript
* **Backend:** Vercel Serverless Functions (Node.js)
* **LLM Engine:** OpenAI Node.js SDK (`gpt-4o-mini` with structured JSON mode)

---

## 📁 Project Structure

```
conesta/
│
├── api/
│   └── script.js      # Serverless function with guardrail validation
├── index.html         # Premium interactive user interface
├── vercel.json        # Vercel routing rules
├── package.json       # Dependencies (openai)
├── .gitignore         # Local env and dependency exclusion list
└── README.md          # Project documentation
```

---

## ⚙️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amyjemimah2007-lab/conesta.git
   cd conesta
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```
   *Note: If no API key is specified, the application automatically enters offline demo/preview mode with structured local fallback mocks to test the UI flow.*

4. **Run or deploy:**
   - For local development, run: `npx vercel dev` or setup a local node server.
   - For production deployment, push to GitHub or run `npx vercel --prod`.

---

## 🔒 Security & Guardrails

The application protects user experience and API tokens through:
1. **Frontend Constraints:** Limits input length and filters out empty requests.
2. **LLM Guardrails:** Custom system instructions evaluate input safety and relevance, returning a structured error if the user inputs unsafe activities, spam, or gibberish.
3. **Environment Isolation:** API keys remain strictly server-side on Vercel's hosting environment.
