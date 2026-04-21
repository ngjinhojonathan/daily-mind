# 🌿 Daily Mind

A personal daily gratitude and meditation web app. No external APIs — fully offline-capable, all data stored in your browser.

**Live:** https://daily-mind-l9fz0q8fd-ngjinhojonathans-projects.vercel.app/

---

## Features

### 🌿 Gratitude Tab
- Random affirmation quotes (50 built-in "I am grateful for..." prompts)
- Save favourites — persisted to localStorage
- Daily gratitude reminder via push notification

### 🧘 Meditation Tab
- Timer with 2 / 5 / 10 min durations
- Animated breathing guide (Inhale → Hold → Exhale → Rest)
- **Ambient sounds** — Rain 🌧, Forest 🌲, Singing Bowl 🔔 (Web Audio API, no files)
- Session logging with streak tracker
- Monthly calendar heatmap of meditated days
- Scrollable session history
- Daily meditation reminder via push notification

### 🎨 UI
- Dark mode by default, toggleable
- Two-tab layout, responsive / mobile-friendly

---

## Getting Started

```bash
npm install
env PORT=4000 npm run dev
```

Open [http://localhost:4000](http://localhost:4000).

> **Note:** This project requires Node ≤ 19 (Next.js 14). If your Node version is newer, use a version manager to pin to Node 19.

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14.2 (App Router) |
| Styling | Tailwind CSS v3 |
| Runtime | React 18 (all `'use client'`) |
| Sound | Web Audio API (procedural generation) |
| Notifications | Service Worker |
| Persistence | localStorage |
| Deployment | Vercel |

---

## Project Structure

```
app/
├── page.js                    # Root page — tabs, state, dark mode
├── layout.js                  # HTML layout
├── globals.css                # Tailwind + breathing animation keyframes
├── api/quote/route.js         # Returns a random gratitude affirmation
└── components/
    ├── QuoteCard.js           # Quote display + save button
    ├── FavouritesPanel.js     # Saved quotes list
    ├── MeditationTimer.js     # Timer + breathing + ambient sounds + reminder
    ├── StreakPanel.js         # Streak stats + heatmap + session log
    └── ReminderSettings.js   # Gratitude notification settings
public/
└── sw.js                      # Service worker — 4 notification types
```
