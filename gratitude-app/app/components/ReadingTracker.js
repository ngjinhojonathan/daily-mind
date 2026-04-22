'use client';

import { useState, useEffect } from 'react';

const READING_LOG_KEY = 'reading_log';       // [{ date, pages, note }]
const READING_GOAL_KEY = 'reading_goal';     // daily page goal (number)
const DEFAULT_GOAL = 20;

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseLocal(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function calcReadingStreak(log) {
  // log: [{ date, pages }] — already filtered to days where pages > 0
  const datesWithReading = [...new Set(
    log.filter(e => e.pages > 0).map(e => e.date)
  )].sort();

  if (!datesWithReading.length) return { current: 0, longest: 0, totalDays: 0 };

  let longest = 1, run = 1;
  for (let i = 1; i < datesWithReading.length; i++) {
    const diff = Math.round(
      (parseLocal(datesWithReading[i]) - parseLocal(datesWithReading[i - 1])) / 86400000
    );
    if (diff === 1) { run++; if (run > longest) longest = run; }
    else run = 1;
  }

  const set = new Set(datesWithReading);
  const todayStr = toDateStr(new Date());
  const yestStr = toDateStr(addDays(new Date(), -1));

  let current = 0;
  if (set.has(todayStr) || set.has(yestStr)) {
    let check = new Date();
    check.setHours(0, 0, 0, 0);
    if (!set.has(todayStr)) check = addDays(check, -1);
    while (set.has(toDateStr(check))) {
      current++;
      check = addDays(check, -1);
    }
  }

  return { current, longest, totalDays: datesWithReading.length };
}

export default function ReadingTracker({ darkMode }) {
  const today = toDateStr(new Date());

  const [log, setLog] = useState([]);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [pagesInput, setPagesInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Load persisted data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(READING_LOG_KEY);
      setLog(raw ? JSON.parse(raw) : []);
    } catch { setLog([]); }
    const savedGoal = parseInt(localStorage.getItem(READING_GOAL_KEY));
    if (!isNaN(savedGoal) && savedGoal > 0) setGoal(savedGoal);
  }, []);

  function persistLog(updated) {
    setLog(updated);
    localStorage.setItem(READING_LOG_KEY, JSON.stringify(updated));
  }

  // Today's total pages from all entries
  const todayEntries = log.filter(e => e.date === today);
  const todayPages = todayEntries.reduce((sum, e) => sum + e.pages, 0);
  const progress = Math.min(100, Math.round((todayPages / goal) * 100));
  const goalMet = todayPages >= goal;

  const { current: streakCurrent, longest: streakLongest, totalDays } = calcReadingStreak(log);
  const totalPages = log.reduce((sum, e) => sum + e.pages, 0);

  function logPages() {
    const pages = parseInt(pagesInput);
    if (isNaN(pages) || pages <= 0) return;
    const entry = { date: today, pages, note: noteInput.trim(), ts: Date.now() };
    persistLog([...log, entry]);
    setPagesInput('');
    setNoteInput('');
  }

  function saveGoal() {
    const g = parseInt(goalInput);
    if (!isNaN(g) && g > 0) {
      setGoal(g);
      localStorage.setItem(READING_GOAL_KEY, String(g));
    }
    setEditingGoal(false);
  }

  function deleteEntry(ts) {
    persistLog(log.filter(e => e.ts !== ts));
  }

  // Last 7 days summary for mini calendar
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), -(6 - i));
    const ds = toDateStr(d);
    const pages = log.filter(e => e.date === ds).reduce((s, e) => s + e.pages, 0);
    return { date: ds, pages, label: d.toLocaleDateString('en', { weekday: 'short' }) };
  });

  const maxPages = Math.max(...last7.map(d => d.pages), 1);

  // Styles
  const card = darkMode
    ? 'bg-gray-800/60 border border-gray-700/50'
    : 'bg-white/80 border border-gray-200';
  const inputCls = darkMode
    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-emerald-500'
    : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-emerald-400';
  const labelCls = darkMode ? 'text-gray-400' : 'text-gray-500';
  const textMain = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const btnPrimary = 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all';
  const btnGhost = darkMode
    ? 'text-gray-400 hover:text-gray-200 text-sm transition-colors'
    : 'text-gray-500 hover:text-gray-700 text-sm transition-colors';
  const historyRow = darkMode ? 'border-gray-700' : 'border-gray-100';

  return (
    <div className="w-full max-w-lg flex flex-col gap-4 pb-4">

      {/* Today's Progress Card */}
      <div className={`${card} rounded-3xl px-6 py-5 flex flex-col gap-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-semibold ${textMain}`}>📖 Today's Reading</h2>
            <p className={`text-xs ${textSub}`}>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-bold ${goalMet ? 'text-emerald-400' : textMain}`}>{todayPages}</span>
            <span className={`text-sm ${textSub}`}> / {goal} pages</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className={`h-3 rounded-full transition-all duration-500 ${goalMet ? 'bg-emerald-400' : 'bg-emerald-500/70'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {goalMet ? (
          <p className="text-emerald-400 text-sm font-medium text-center">🎉 Daily goal reached! Keep going!</p>
        ) : (
          <p className={`text-xs text-center ${textSub}`}>{goal - todayPages} more pages to hit your goal</p>
        )}

        {/* Log pages form */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              placeholder="Pages read"
              value={pagesInput}
              onChange={e => setPagesInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && logPages()}
              className={`border rounded-xl px-3 py-2 text-sm w-28 outline-none focus:ring-1 focus:ring-emerald-500 ${inputCls}`}
            />
            <input
              type="text"
              placeholder="Book / note (optional)"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && logPages()}
              className={`border rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-1 focus:ring-emerald-500 ${inputCls}`}
            />
          </div>
          <button onClick={logPages} className={btnPrimary}>+ Log Pages</button>
        </div>

        {/* Today's entries */}
        {todayEntries.length > 0 && (
          <div className="flex flex-col gap-1 pt-1">
            <p className={`text-xs font-medium ${labelCls}`}>Today's sessions:</p>
            {todayEntries.map(e => (
              <div key={e.ts} className={`flex items-center justify-between text-sm ${textSub}`}>
                <span>
                  <span className={`font-semibold ${textMain}`}>{e.pages}p</span>
                  {e.note && <span className="ml-2 italic">{e.note}</span>}
                </span>
                <button onClick={() => deleteEntry(e.ts)} className="text-xs text-rose-400 hover:text-rose-500 ml-2">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Day Streak 🔥', value: streakCurrent },
          { label: 'Longest 🏆', value: streakLongest },
          { label: 'Total Pages', value: totalPages },
        ].map(({ label, value }) => (
          <div key={label} className={`${card} rounded-2xl px-3 py-4 text-center`}>
            <div className={`text-2xl font-bold ${textMain}`}>{value}</div>
            <div className={`text-xs mt-1 ${textSub}`}>{label}</div>
          </div>
        ))}
      </div>

      {/* 7-day bar chart */}
      <div className={`${card} rounded-3xl px-6 py-5`}>
        <p className={`text-sm font-medium mb-3 ${textMain}`}>Last 7 Days</p>
        <div className="flex items-end gap-1.5 h-16">
          {last7.map(({ date, pages, label }) => {
            const h = pages > 0 ? Math.max(12, Math.round((pages / maxPages) * 56)) : 4;
            const isToday = date === today;
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  title={`${pages} pages`}
                  className={`w-full rounded-t-md transition-all ${
                    isToday
                      ? 'bg-emerald-400'
                      : pages >= goal
                      ? 'bg-emerald-600/60'
                      : pages > 0
                      ? (darkMode ? 'bg-gray-500' : 'bg-gray-300')
                      : (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                  }`}
                  style={{ height: `${h}px` }}
                />
                <span className={`text-[10px] ${isToday ? 'text-emerald-400 font-bold' : textSub}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily goal setting */}
      <div className={`${card} rounded-2xl px-5 py-4 flex items-center justify-between gap-3`}>
        <div>
          <p className={`text-sm font-medium ${textMain}`}>Daily Page Goal</p>
          <p className={`text-xs ${textSub}`}>Currently: {goal} pages/day</p>
        </div>
        {editingGoal ? (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              value={goalInput}
              onChange={e => setGoalInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveGoal(); if (e.key === 'Escape') setEditingGoal(false); }}
              autoFocus
              className={`border rounded-lg px-2 py-1 text-sm w-20 outline-none focus:ring-1 focus:ring-emerald-500 ${inputCls}`}
            />
            <button onClick={saveGoal} className="text-emerald-400 text-sm font-semibold">Save</button>
            <button onClick={() => setEditingGoal(false)} className={`text-xs ${textSub}`}>Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => { setGoalInput(String(goal)); setEditingGoal(true); }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:border-emerald-500 hover:text-emerald-400' : 'border-gray-300 text-gray-500 hover:border-emerald-400 hover:text-emerald-600'}`}
          >
            Edit Goal
          </button>
        )}
      </div>

      {/* History toggle */}
      <button onClick={() => setShowHistory(v => !v)} className={`${btnGhost} text-center`}>
        {showHistory ? '▲ Hide history' : `📚 Reading history (${totalDays} days logged)`}
      </button>

      {showHistory && (
        <div className={`${card} rounded-3xl px-6 py-4 flex flex-col gap-2 max-h-64 overflow-y-auto`}>
          <p className={`text-sm font-semibold ${textMain} mb-1`}>All Sessions</p>
          {log.length === 0 && <p className={`text-sm ${textSub}`}>No sessions logged yet.</p>}
          {[...log].reverse().map(e => (
            <div key={e.ts} className={`flex items-center justify-between py-1.5 border-b ${historyRow} last:border-0`}>
              <div>
                <span className={`text-sm font-medium ${textMain}`}>{e.pages}p</span>
                {e.note && <span className={`text-xs ml-2 italic ${textSub}`}>{e.note}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${textSub}`}>{e.date}</span>
                <button onClick={() => deleteEntry(e.ts)} className="text-xs text-rose-400 hover:text-rose-500">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
