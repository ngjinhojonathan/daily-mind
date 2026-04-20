# Copilot Instructions — Gratitude App

## What this project is
A personal web app for daily gratitude and meditation practice. No external APIs. All data lives in localStorage. Built for a single user running locally on a corporate Linux server.

## Stack
- **Next.js 14.2.35** (App Router, JavaScript — NOT TypeScript). Do NOT upgrade to Next.js 16+; the server runs Node 19 which is incompatible.
- **Tailwind CSS v3** with `darkMode: 'class'`. Content paths: `./app/**/*.{js,jsx}`.
- **React 18** — all components use `'use client'`.
- **Service Worker** at `public/sw.js` for background notifications.
- **No external API calls** — ZenQuotes is blocked on the corporate network. All quotes are in `app/api/quote/route.js`.

## How to start the dev server
The shell is **csh** — `PORT=4000 npm run dev` does NOT work in csh. Always use:
```
bash -c 'PORT=4000 npm run dev'
```
Or: `env PORT=4000 npm run dev`

If a port is already in use, pick a new one (3010, 4000, 4001, etc). Multiple stale `next` processes can pile up — use `pgrep -f next | xargs kill` to clean them before starting fresh.

## File structure
```
app/
├── page.js                    # Root — tab state, dark mode, SW registration
├── layout.js                  # <html suppressHydrationWarning class="dark">
├── globals.css                # Tailwind directives + @keyframes breathe (13s)
├── api/quote/route.js         # 50 local "I am grateful for..." quotes
└── components/
    ├── QuoteCard.js           # Quote display + save button
    ├── FavouritesPanel.js     # Saved quotes list
    ├── MeditationTimer.js     # Timer + breathing animation + meditation reminder
    ├── StreakPanel.js         # Streak stats + monthly calendar + session log
    └── ReminderSettings.js   # Gratitude push notification settings
public/sw.js                   # Service worker — 4 message types for notifications
.vscode/settings.json          # css.validate: false (suppresses @tailwind warnings)
```

## UI layout
Two tabs at the top — **🌿 Gratitude** and **🧘 Meditation**. No bottom nav.
- Gratitude tab: QuoteCard + Favourites toggle
- Meditation tab: MeditationTimer (with reminder inside) + StreakPanel (embedded, no close button)

## localStorage keys
| Key | Type | Purpose |
|---|---|---|
| `gratitude_favourites` | `[{q}]` | Saved quotes |
| `gratitude_theme` | `"dark"/"light"` | Theme preference |
| `gratitude_reminder_time` | `"HH:MM"` | Gratitude notification time |
| `meditation_reminder_time` | `"HH:MM"` | Meditation notification time |
| `meditation_log` | `["YYYY-MM-DD"]` | Days with ≥1 session (for streak/heatmap) |
| `meditation_sessions` | `[{date, durationSeconds, completedAt}]` | Full session records |

## Service worker message types
`SCHEDULE_REMINDER`, `CANCEL_REMINDER`, `SCHEDULE_MEDITATION`, `CANCEL_MEDITATION`

## Known gotchas — do NOT repeat these mistakes
1. **Hydration mismatch**: Dark mode sets a class on `<html>` after SSR. Always keep `suppressHydrationWarning` on `<html>` and `<body>` in layout.js, and keep the `mounted` guard (`if (!mounted) return null`) in page.js.
2. **Duplicate exports**: When rewriting a component file, always verify no old code remains below the new `export default`. Use `wc -l` to count lines and truncate with `head -N` if needed.
3. **@swc/helpers**: If you see `Cannot find module @swc/helpers`, run `npm install @swc/helpers`.
4. **csh shell**: Avoid `2>/dev/null` in csh (it's interpreted differently). Use `bash -c '...'` for complex shell commands.
5. **`aspect-square` in Tailwind v3**: Works fine — no need to add custom CSS.
6. **Service worker**: After editing `public/sw.js`, hard-refresh the browser (Ctrl+Shift+R) to pick up changes.

## Code conventions
- Dark mode styling: always pass `darkMode` as a prop; use ternary `darkMode ? 'dark-class' : 'light-class'` inline.
- Components that are "embedded" (no close button needed) receive an `embedded` prop — guard the close button with `{!embedded && onClose && ...}`.
- Date strings are always `YYYY-MM-DD` format using the local `toDateStr()` helper (NOT `toISOString()` which gives UTC).
- The breathing animation cycle is 13s total: Inhale 4s, Hold 2s, Exhale 4s, Rest 3s — this must match `@keyframes breathe` in globals.css.
