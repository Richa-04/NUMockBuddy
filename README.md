# NUMockBuddy

An AI-powered mock interview platform built for Northeastern University students. Practice technical and behavioral interviews, get instant AI feedback, analyze your resume, and book sessions with peer volunteers — all in one place.

---

## Project Overview

NUMockBuddy helps NU students prepare for internship and full-time interviews. Students can run fully simulated AI mock interviews with real-time speech transcription, body language analysis, and a multi-expert AI scoring panel. They can also upload their resume for deep ATS analysis and keyword matching, chat with an AI resume coach, or book 1-on-1 sessions with fellow Huskies who have co-op experience.

---

## Features

### AI Mock Interview (Practice)
- 4-step setup: job type, company, role, and interview type (Technical / Behavioral / System Design / HR)
- Supports 11 role types: SWE, Data Science, ML Engineer, TPM, Product Manager, Audit, and more
- Live interview session with camera, microphone, and optional whiteboard (Excalidraw)
- In-browser code editor (Monaco Editor) for technical questions
- Real-time speech-to-text transcription via AssemblyAI
- Filler word detection and repeated-phrase tracking
- Post-session scoring by a panel of 6 AI experts (Communication, Technical, Problem-Solving, Behavioral, Confidence, Overall) powered by Claude
- Model answers for every question (code solutions or STAR-format answers depending on interview type)
- Body language analysis: eye contact, confidence, and engagement scores from recorded video
- Full results page with scores, strengths, improvements, and side-by-side model answer comparison

### Dashboard
- Personal stats overview: total sessions, average score, best score, and practice streak
- Score trend bar chart with filters (All Time, This Month, Technical Only, Behavioral Only)
- Latest session card with body language metrics (eye contact, confidence, engagement)
- Full session history table with verdict badges and detailed per-session stats

### Resume AI
- Three-tab interface: Job Description Analysis, ATS Scanner, and AI Resume Chat
- **JD Analysis**: upload or paste resume + paste a job description → AI scores keyword match, seniority signal, formatting issues, action verbs, missing metrics, and more
- **ATS Scanner**: upload resume + select company → ATS pass probability with company-specific keyword requirements
- **AI Chat**: RAG-powered resume coach — ask questions about your resume in natural language
- Supports PDF upload and text paste; PDF preview panel

### Peer Volunteers
- Browse NU students with co-op/internship experience at companies like Google, Amazon, Microsoft, Fidelity
- Filter by company, role, or availability
- Calendar-based booking: pick a date, pick a time slot, enter your email → confirmation sent to both parties
- Volunteer signup flow: 2-step form (profile + availability calendar)

### Authentication
- NUID-based login ("Sign in with NUid")
- Session managed via `nuid` cookie, checked across all protected routes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, inline styles, Tailwind CSS 4 |
| AI / LLM | Anthropic Claude (`claude-sonnet-4-6`) via `@anthropic-ai/sdk` |
| Speech-to-Text | AssemblyAI |
| RAG / Embeddings | LangChain (`@langchain/core`, `@langchain/openai`, `@langchain/community`) |
| Database ORM | Prisma 7 with Prisma Accelerate |
| Database | PostgreSQL (via `pg`) |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Whiteboard | Excalidraw (`@excalidraw/excalidraw`) |
| Charts | Recharts |
| PDF Parsing | `pdf-parse`, `pdfjs-dist` |
| DOCX Parsing | `mammoth` |
| Email | Nodemailer, Resend |
| Auth | `bcryptjs`, custom cookie-based session |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Richa-04/NUMockBuddy.git
cd NUMockBuddy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Database (Prisma Accelerate URL)
DATABASE_URL=prisma+postgres://<accelerate-host>/?api_key=<your-key>

# Direct PostgreSQL connection (required for prisma migrate dev)
DIRECT_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-...

# AssemblyAI (speech transcription)
ASSEMBLYAI_API_KEY=...

# OpenAI (LangChain embeddings for Resume AI chat)
OPENAI_API_KEY=sk-...

# Email (Resend — for volunteer booking confirmations)
RESEND_API_KEY=re_...
```

### 4. Apply database migrations

```bash
npx prisma migrate dev
```

> Requires `DIRECT_URL` to be set. Prisma Accelerate does not support `migrate dev`.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Prisma Accelerate connection string |
| `DIRECT_URL` | Yes (migrations) | Direct PostgreSQL URL for `prisma migrate` |
| `ANTHROPIC_API_KEY` | Yes | Powers interview scoring and model answers |
| `ASSEMBLYAI_API_KEY` | Yes | Real-time speech-to-text transcription |
| `OPENAI_API_KEY` | Yes | LangChain embeddings for Resume AI RAG chat |
| `RESEND_API_KEY` | Yes | Email confirmations for volunteer bookings |

---

## Team Members & Contributions

| Name | Feature Area |
|---|---|
| **Richa Padhariya** | Practice feature — AI mock interview flow, speech analysis (filler/repeat detection), body language analysis, whiteboard integration, multi-expert AI scoring, session persistence, results page, dashboard session history |
| *(teammate)* | Resume AI — JD analysis, ATS scanner, RAG chatbot, PDF/DOCX parsing |
| *(teammate)* | Volunteers — peer volunteer listings, availability calendar, booking system, signup flow |
| *(teammate)* | Home page, shared UI components (Navbar, Button, Badge), authentication |

> Update teammate names above once confirmed.

---

## Screenshots

*Coming soon*

<!-- Add screenshots here:
![Home](screenshots/home.png)
![Practice Setup](screenshots/practice-setup.png)
![Interview Session](screenshots/session.png)
![Results](screenshots/results.png)
![Resume AI](screenshots/resume-ai.png)
![Dashboard](screenshots/dashboard.png)
![Volunteers](screenshots/volunteers.png)
-->

---

## License

This project was built for educational purposes at Northeastern University.
