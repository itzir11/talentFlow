# TalentFlow – A Mini Hiring Platform (Front-End Only)

TalentFlow is a **React + TypeScript** application that simulates a hiring platform for HR teams.  
It provides job management, candidate tracking, and assessment building features.  

This is a **front-end only** project. The app uses **MSW (Mock Service Worker) / MirageJS** to simulate APIs and persists data locally using **IndexedDB (via Dexie/localForage)**.

---

## 🚀 Features

### 🔹 Jobs
- Job board with **server-like pagination & filtering** (title, status, tags).
- Create/Edit job via modal/route with validation (required title, unique slug).
- Archive/Unarchive jobs.
- Reorder jobs with drag-and-drop (**optimistic updates + rollback on error**).
- Deep-linking to `/jobs/:jobId`.

### 🔹 Candidates
- Virtualized list of **1000+ seeded candidates** for smooth rendering.
- Client-side search (name/email) + server-like filtering (stage).
- Candidate profile at `/candidates/:id` with timeline of status changes.
- Move candidates between stages on a **kanban board** (drag-and-drop).
- Add notes with `@mentions` (rendered from a local list).

### 🔹 Assessments
- Job-specific assessment builder with support for:
  - Single-choice
  - Multi-choice
  - Short text
  - Long text
  - Numeric (with range validation)
  - File upload stub
- **Live preview pane** to test the assessment as a fillable form.
- Candidate responses stored locally with validation (required fields, ranges, max length).
- Conditional questions (e.g., show Q3 only if Q1 === "Yes").

---

## ⚙️ Tech Stack

- **React (with TypeScript)**
- **React Router** – for routes like `/jobs/:id`, `/candidates/:id`
- **React Query / Zustand / Redux Toolkit** – state & API management
- **MSW or MirageJS** – mock API simulation
- **Dexie.js / localForage** – IndexedDB persistence
- **React Beautiful DnD / Dnd Kit** – drag-and-drop
- **React Virtualized / React Window** – for large candidate lists
- **TailwindCSS / Material UI / ShadCN UI** – UI components

---

## 📂 Project Structure

```
talentflow/
│── src/
│   ├── api/              # Mock API handlers (MSW/Mirage)
│   ├── components/       # Reusable UI components
│   ├── features/
│   │   ├── jobs/         # Jobs board + CRUD + reorder
│   │   ├── candidates/   # Virtualized list, Kanban board, profile
│   │   ├── assessments/  # Builder + Preview + Form runtime
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Routes (/jobs, /candidates, /assessments)
│   ├── store/            # State management
│   ├── utils/            # Helpers (validation, slugify, etc.)
│   └── index.tsx         # Entry point
│
└── README.md
```

---

## 📦 Setup & Installation

```bash
# Clone repository
git clone https://github.com/itzir11/talentFlow.git
cd talentFlow

# Install dependencies
npm install   # or yarn install

# Start development server
npm run dev   # or yarn dev
```

Visit: **http://localhost:5173/** (Vite) or **http://localhost:3000/** (CRA)

---

## 🗄️ Data & Persistence

- Mock API requests handled via **MSW / MirageJS**.  
- Persistence through **IndexedDB (Dexie/localForage)**.  
- Artificial latency (200–1200ms) + **5–10% failure rate** on write requests for realistic UX.  
- On refresh, app restores state from IndexedDB.  

---

## 📑 Deliverables

- **Deployed App:** [Live Demo Link Here](https://talent-flow-ochre.vercel.app/)  
- **GitHub Repository:** [Repo Link](https://github.com/itzir11/talentFlow)  

---

## 🧪 Testing

- Includes unit tests for components and utils (`Jest / React Testing Library`).  
- Error boundary & optimistic UI rollback covered.  

---

## ✨ Bonus Features (Optional / Implemented if applicable)

- Dark mode toggle 🌙  
- Job tag filtering with autocomplete  
- Offline-first caching with IndexedDB  
- Better drag-and-drop animations (using Framer Motion)  

---

## 🤝 Author

👤 **Your Name**  
- GitHub: [itzir11](https://github.com/itzir11)  
- LinkedIn: [Your LinkedIn](#)  

---
