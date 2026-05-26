# ⚡ EnergyWise

**Track. Understand. Act.** — A full-stack web app aligned with SDG 7: Affordable and Clean Energy.

## Project Overview

EnergyWise is a dynamic web application for tracking personal energy consumption, 
visualizing CO₂ emissions by source, and advocating for clean energy — especially nuclear power.

Built for the DWES module (RA7 — Asynchronous communication) + Sustainability module (RA1–RA6).

---

## Pages (10 total)

| # | Page | Content |
|---|------|---------|
| 1 | Home | Hero, quick stats, source comparison chart |
| 2 | My Logs | Full CRUD — add/edit/delete energy logs, filter table |
| 3 | Dashboard | Live charts from API — kWh by source, category breakdown |
| 4 | Calculator | CO₂ calculator comparing energy sources |
| 5 | SDG 7 | ODS explanation + ESG impact (RA1) |
| 6 | Nuclear | Science-based case for nuclear energy |
| 7 | The Problem | Problem statement + how the app helps (RA2) |
| 8 | Our Practices | Sustainable dev practices + dark mode rationale (RA3, RA5) |
| 9 | Patagonia | Company sustainability analysis (RA6) |
| 10 | About | Technical architecture, API docs, run instructions |

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/logs | Get all logs (supports ?category=, ?source=, ?from=, ?to=) |
| GET | /api/logs/:id | Get single log |
| POST | /api/logs | Create new log |
| PUT | /api/logs/:id | Update existing log |
| DELETE | /api/logs/:id | Delete log |
| GET | /api/stats | Aggregated stats (totals, by category, by source) |

All responses are JSON. Data is persisted in `server/db.json`.

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (SPA with custom router)
- **Backend**: Node.js + Express.js
- **Data**: Local JSON file (`server/db.json`)
- **Async**: `fetch()` with `async/await` and `.then/.catch`
- **Dependencies**: `express`, `cors` (production) + `nodemon` (dev)

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
http://localhost:3000
```

For development with auto-restart:
```bash
npm run dev
```

Requires Node.js v18+. No database setup required.

---

## Sustainable Features

- 🌙 **Dark mode by default** — saves OLED energy
- ⚡ **On-demand API calls only** — no background polling
- 📄 **SPA architecture** — no full page reloads
- 🖼️ **Zero heavy images** — all visuals are CSS/SVG
- 📦 **Minimal dependencies** — only 2 production packages
- 🔌 **Clean code** — easy to maintain, fewer dev compute cycles

---

## Academic Coverage

| Module | RA | Coverage |
|--------|----|----------|
| Client Dev | RA7 | fetch(), async/await, DOM, CRUD UI, form validation, SPA router |
| Sustainability | RA1 | SDG 7 page with ESG (environmental, social, governance) analysis |
| Sustainability | RA2 | "The Problem" — energy blindness + fossil fuel crisis |
| Sustainability | RA3 | Developer practices — no paper, cloud collab, power management |
| Sustainability | RA4 | CRUD for energy logs — circular economy framing |
| Sustainability | RA5 | Dark mode, clean code, no unnecessary requests, SVG visuals |
| Sustainability | RA6 | Patagonia analysis — sustainability report, stakeholders, metrics |
