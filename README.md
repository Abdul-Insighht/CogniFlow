# CogniFlow

CogniFlow is an original hackathon demo for an emotionally aware second brain for university students. It combines task planning, local knowledge memory, cognitive state detection, and human-approved recommendations in one browser-based prototype.

The demo is designed for the June 14-21, 2026 build window and uses only original code plus standard browser APIs. It does not require paid APIs, cloud storage, personal datasets, or proprietary data.

## What It Solves

Students often know their tasks but cannot decide what to do first when overloaded. Notes, deadlines, assignments, and exam pressure are spread across different tools. CogniFlow gives one decision-support surface that reads a student's check-in, estimates cognitive load, retrieves relevant notes, and recommends a smaller action plan.

## Demo Features

- Task intake with course, due date, priority, and effort.
- Natural language check-in for stress/focus analysis.
- Pattern-based cognitive state classifier: focused, neutral, stressed, overwhelmed.
- Local second-brain memory with cosine-similarity retrieval over saved notes.
- Adaptive planner that changes workload based on cognitive state.
- Human-in-the-loop accept, edit, and reject controls.
- Responsible AI screen with privacy, transparency, and limitation notices.
- Browser localStorage persistence.

## Run The Demo

Open `index.html` in a browser. No installation is required. The app is fully static and works offline after loading.

For a local browser URL, run:

```bash
cd /home/techbin/Abdul_Rehman/CogniFlow
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Complete JavaScript System

The static app now includes the full usable workflow in JavaScript:

- Main project overview page for non-technical users.
- Demo guide page with step-by-step usage and expected output.
- Check-in validation and cognitive-state analysis.
- Task add, edit, complete, delete, clear done, and clear all.
- Note add, edit, delete, search, and clear.
- Study log add, edit, delete, weak-topic detection, and history questions such as `What did I study yesterday?`.
- Retrieval ranking that weights the active high-priority task and weak-topic terms.
- Adaptive plan generation with accept, edit, and reject controls.
- Local data reset, JSON export, and JSON import.
- Browser-only persistence through `localStorage`; no backend or paid API is required.

## Deploy The Static App

Upload these files/folders to GitHub Pages, Netlify, Vercel static hosting, or any normal web server:

```text
index.html
src/app.js
src/styles.css
```

## Recommended Walkthrough

1. Open the dashboard.
2. Click `Load sample`.
3. Review the detected cognitive state, confidence, and signal chips.
4. Review the recommended plan.
5. Click `Edit` to show human control, then save the revised plan.
6. Open `Memory`, ask `What should I revise for DBMS?`, and show retrieved notes.
7. Open `AI Guardrails` and explain privacy and responsible AI controls.

## AI Architecture

```text
Student input
  -> task parser and note memory
  -> cognitive state detector
  -> local retrieval over notes
  -> adaptive planning rules
  -> student accept/edit/reject
  -> local browser storage
```

The prototype uses transparent analytics so judges can see the reasoning. A production version could replace the simple term-vector retrieval with embeddings and the heuristic classifier with a validated lightweight NLP classifier.

## Data Sources

- User-entered tasks, notes, and check-ins.
- Built-in synthetic sample scenario for demo purposes.
- No external datasets.
- No personal data from third parties.
- No scraped websites.

## Tools And Libraries

- HTML, CSS, JavaScript.
- Browser localStorage and Web Crypto `randomUUID`.
- AI coding assistant used during development and must be disclosed in the submission.

## Responsible AI Position

CogniFlow is decision support, not therapy, diagnosis, or a replacement for human judgment. The student controls whether a plan is accepted. The demo keeps data in the local browser and exposes the detected signals behind the recommendation.

