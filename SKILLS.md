# 🌿 Gratitude App — Build Summary

## Project Overview
A personal web app for daily gratitude and meditation practice, built with Next.js 14 + Tailwind CSS v3. No external APIs — fully offline-capable. All data persisted to localStorage.

**Live dev server:** `http://localhost:4000`
**Project root:** `/nfs/site/disks/ddg_store_jinhojon/jon/gratitude-app/`

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14.2.35 | Downgraded from v16 — Node 19 requires ≤ Next 14 |
| Styling | Tailwind CSS v3 | `darkMode: 'class'`, content: `./app/**/*.{js,jsx}` |
| Runtime | React 18 | All components are `'use client'` |
| Notifications | Web Service Worker | Background daily reminders |
| Storage | localStorage | Favourites, theme, reminders, session log |
| Quotes | Local array (50 quotes) | ZenQuotes blocked on corporate network |

---

## App Structure

```
app/
├── page.js                    # Root page — tabs, state, dark mode
├── layout.js                  # Root HTML layout (suppressHydrationWarning)
├── globals.css                # Tailwind directives + breathing animation
├── api/quote/route.js         # Server route returning random "I am grateful for..." quote
└── components/
    ├── QuoteCard.js           # Displays quote, save/new buttons
    ├── FavouritesPanel.js     # Scrollable saved quotes list
    ├── MeditationTimer.js     # Timer + breathing guide + meditation reminder
    ├── StreakPanel.js         # Streak stats + monthly calendar + session log
    └── ReminderSettings.js   # Gratitude notification settings
public/
└── sw.js                      # Service worker — schedules 4 notification types
```

---

## Features Built

### 🌿 Gratitude Tab
- **Random quote display** — 50 "I am grateful for..." affirmations served from a local API route (`/api/quote`)
- **Save / unfavourite** — heart button toggles quote in localStorage favourites
- **Favourites panel** — scrollable list with hover-reveal remove buttons
- **Personal mantra headline** — *"No big deal, I am good either ways"* shown at top of every page

### 🧘 Meditation Tab
- **Meditation timer** — 2 / 5 / 10 min durations with ▶ / ⏸ / ↺ controls
- **Breathing guide** — animated circle with Inhale / Hold / Exhale / Rest phase labels (13s cycle matching CSS keyframes)
- **Ambient sounds** — Rain 🌧 (white noise → low-pass 450 Hz), Forest 🌲 (white noise → band-pass 900 Hz), Singing Bowl 🔔 (sine oscillators at 432 / 864 / 1296 Hz struck every 10s); all via Web Audio API with smooth fade-in/out; Off option always available
- **Session logging** — on timer completion, logs `{ date, durationSeconds, completedAt }` to localStorage
- **Daily meditation reminder** — time picker inside the timer card; posts to service worker
- **Streak stats** — Current streak 🔥, Longest streak 🏆, Total sessions ✨
- **Monthly calendar heatmap** — full month grid (e.g. April 2026), navigable with ‹ › buttons; today ringed, meditated days filled indigo
- **Session log** — scrollable reverse-chronological list showing date label, completion time, duration

### 🎨 UI / UX
- **Dark mode default** — `<html class="dark">` set in layout, persisted to localStorage
- **Light/dark toggle** — ☀️ / 🌙 button top-right
- **Two-tab layout** — clean pill-style tab switcher (Gratitude / Meditation)
- **Responsive** — max-w-lg cards, works on mobile

### 🔔 Notifications (Service Worker)
Four message types handled in `public/sw.js`:

| Message | Notification |
|---|---|
| `SCHEDULE_REMINDER` | 🌿 Daily Gratitude Reminder |
| `CANCEL_REMINDER` | cancels gratitude timer |
| `SCHEDULE_MEDITATION` | 🧘 Time to Meditate |
| `CANCEL_MEDITATION` | cancels meditation timer |

Notifications auto-reschedule for the next day. `notificationclick` opens `/`.

---

## Key Bugs Fixed

| Bug | Root Cause | Fix |
|---|---|---|
| Blank page on load | React hydration mismatch from dark mode `useEffect` modifying `<html>` class | Added `suppressHydrationWarning` to `<html>` and `<body>` in layout.js; added `mounted` guard in page.js |
| Internal Server Error 500 | Missing `@swc/helpers` package | `npm install @swc/helpers` |
| Duplicate export crash | Old code still appended after file rewrite | Truncated StreakPanel.js with `head -267` |
| ZenQuotes 500 / timeout | Corporate network blocks outbound internet | Replaced with 50 local affirmations in `/api/quote/route.js` |
| `PORT=3000` not working in csh | csh doesn't support `VAR=val cmd` syntax | Used `env PORT=4000 npm run dev` or `bash -c 'PORT=4000 ...'` |
| sw.js syntax error | Duplicate `notificationclick` block | Removed orphaned lines |

---

## localStorage Keys

| Key | Contents |
|---|---|
| `gratitude_favourites` | `[{ q: "..." }, ...]` — saved quotes |
| `gratitude_theme` | `"dark"` or `"light"` |
| `gratitude_reminder_time` | `"HH:MM"` — gratitude notification time |
| `meditation_reminder_time` | `"HH:MM"` — meditation notification time |
| `meditation_log` | `["YYYY-MM-DD", ...]` — dates with at least one session |
| `meditation_sessions` | `[{ date, durationSeconds, completedAt }, ...]` — full session records |

---

## Environment Notes

- **OS:** Linux (csh shell default — use `bash -c` for env variable tricks)
- **Node:** v19 — incompatible with Next.js ≥16
- **Dev server:** multiple stale processes can occupy ports; use `env PORT=XXXX npm run dev` on a fresh port
- **VS Code warnings to ignore:**
  - `Unknown at-rule @tailwind` — cosmetic only; fixed with `"css.validate": false` in `.vscode/settings.json`
  - `tsconfig.json` errors in `linked_home_dirs/.vscode-server/...` — VS Code internal extension, not your code

---

## Deployment

- **GitHub:** https://github.com/ngjinhojonathan/daily-mind
- **Vercel:** https://daily-mind-3og0lgrfb-ngjinhojonathans-projects.vercel.app
- Auto-deploys on every push to `main`
- `export const dynamic = 'force-dynamic'` + `Cache-Control: no-store` on API route prevents quote caching
- Client fetch uses `?t=${Date.now()}` + `cache: 'no-store'` for browser cache-busting

---

## Suggested Next Steps

- [x] Deploy to Vercel
- [x] Ambient background sounds (Web Audio API — rain, forest, bowl)
- [ ] Gratitude journal entries (let user write their own entries, not just view quotes)
- [ ] Mood check-in (emoji scale before/after session, weekly trend chart)
- [ ] Multiple breathing modes (box breathing 4-4-4-4, 4-7-8)
- [ ] Milestone badges (unlock at 1, 7, 21, 30, 100 sessions)
- [ ] Weekly summary ("You meditated 5/7 days for 35 min total")
- [ ] "On This Day" — show past gratitude entries from same date
- [ ] Streak freeze mechanic (1 grace day per week)
