<div align="center">
  <img width="1200" height="475" alt="Journal – AI Powered Diary App" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Journal – AI Powered Diary App

Journal is a modern, privacy‑focused personal diary with:

- **Beautiful UI**: Dark, minimal interface designed for daily journaling.
- **AI insights**: Summaries and reflections generated from your entries.
- **Rich entries**: Support for moods, tags, locations, and images.
- **Search & history**: Powerful search, filters, and a calendar heatmap.
- **Export**: Generate a PDF of your journal.

---

## Tech Stack

- **Frontend**: React + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS (via CDN) + custom styles
- **AI**: Gemini API (via `@google/genai`)
- **PDF generation**: `jspdf`

---

## Getting Started

### Prerequisites

- **Node.js** (LTS recommended)
- A **Gemini API key**

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Create a `.env.local` file in the project root.
   - Add your Gemini key:
     ```bash
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Then open the printed URL in your browser (usually `http://localhost:3000`).

---

## PWA Support

Journal is set up as a **Progressive Web App (PWA)**:

- Installable from supported browsers (e.g. Chrome) as a standalone app.
- Includes a web app manifest and a basic service worker.

---

## Scripts

- **`npm run dev`** – Start the development server.
- **`npm run build`** – Create a production build.
- **`npm run preview`** – Preview the production build locally.

---

## License

Personal / portfolio use. If you’d like to use or extend this project commercially, please reach out to the author.
