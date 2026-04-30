# Houseiana Leads Management Dashboard

Bilingual (Arabic / English) Next.js frontend for managing **Fresh Leads** and **Contacted Leads** at Houseiana.

## Stack

- Next.js 14 (App Router) + JavaScript
- React 18
- localStorage for persistence (no backend required)
- Plain CSS (Houseiana branding: white / yellow accent / dark text)
- Full RTL/LTR layout switching

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm run start
```

## Features

- **Two main tabs**: Fresh Leads & Contacted Leads
- **Global Phone Search** — normalized matching across both lists
- **Add / Edit / Delete / View Details** for both lead types
- **Mark as Contacted** — convert a fresh lead into a contacted lead
- **Filters** per section (Area, Project, Source, Status, Sales, Unit)
- **Dashboard cards** with totals and per-status counts
- **Responsive tables** (stacked cards on mobile)
- **Bilingual** UI (AR/EN) with persistent language selection

## localStorage Keys

- `houseiana_fresh_leads`
- `houseiana_contacted_leads`
- `houseiana_language`

## Project Structure

```
app/
  layout.js
  page.js          # main dashboard wiring
  globals.css
components/        # all UI components
lib/
  translations.js  # AR / EN dictionary + status options
  storage.js       # localStorage helpers
  utils.js         # phone normalization, dates, validation
```
