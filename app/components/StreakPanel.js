'use client';

import { useState, useEffect } from 'react';

const MEDITATION_LOG_KEY = 'meditation_log';
const MEDITATION_SESSIONS_KEY = 'meditation_sessions';

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

function calcStreaks(dates) {
  if (!dates.length) return { current: 0, longest: 0, total: 0 };

  let longest = 1, run = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round((parseLocal(dates[i]) - parseLocal(dates[i - 1])) / 86400000);
    if (diff === 1) { run++; if (run > longest) longest = run; }
    else run = 1;
  }

  const set = new Set(dates);
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

  return { current, longest, total: dates.length };
}

export default function StreakPanel({ darkMode, onClose, refreshKey, embedded = false }) {
  const [stats, setStats] = useState({ current: 0, longest: 0, total: 0 });
  const [logSet, setLogSet] = useState(new Set());
  const [sessions, setSessions] = useState([]);

  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState({
    year: todayObj.getFullYear(),
    month: todayObj.getMonth(),
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MEDITATION_LOG_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const sorted = [...new Set(arr)].sort();
      setLogSet(new Set(sorted));
      setStats(calcStreaks(sorted));
    } catch {
      setLogSet(new Set());
    }
    try {
      const raw = localStorage.getItem(MEDITATION_SESSIONS_KEY);
      setSessions(raw ? JSON.parse(raw) : []);
    } catch {
      setSessions([]);
    }
  }, [refreshKey]);

  function prevMonth() {
    setViewMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  }

  function nextMonth() {
    setViewMonth(({ year, month }) => {
      const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
      const now = new Date();
      if (next.year > now.getFullYear() || (next.year === now.getFullYear() && next.month > now.getMonth())) {
        return { year, month };
      }
      return next;
    });
  }

  const isCurrentMonth =
    viewMonth.year === todayObj.getFullYear() && viewMonth.month === todayObj.getMonth();

  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const firstDow = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function cellDateStr(day) {
    return `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const card = darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const divider = darkMode ? 'border-gray-700' : 'border-gray-100';

  return (
    <div className={`${card} rounded-3xl shadow-xl p-6 w-full flex flex-col gap-5 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">📅 Meditation Progress</h2>
        {!embedded && onClose && (
          <button onClick={onClose} className={`${sub} hover:text-rose-400 transition-colors text-xl leading-none`}>✕</button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { value: stats.current, label: 'Current streak', color: 'text-orange-400', icon: '🔥' },
          { value: stats.longest, label: 'Longest streak', color: 'text-amber-400', icon: '🏆' },
          { value: stats.total,   label: 'Total sessions', color: 'text-emerald-400', icon: '✨' },
        ].map(({ value, label, color, icon }) => (
          <div key={label} className={`rounded-2xl py-3 px-2 ${darkMode ? 'bg-gray-700/60' : 'bg-gray-50'}`}>
            <div className={`text-xl font-bold ${color}`}>{icon} {value}</div>
            <div className={`text-xs mt-1 ${sub} leading-tight`}>{label}</div>
          </div>
        ))}
      </div>

      {/* Encouragement */}
      {stats.current > 0 && (
        <p className="text-center text-sm text-indigo-400">
          {stats.current >= 7
            ? `🌟 ${stats.current} days strong — incredible dedication!`
            : stats.current >= 3
            ? `💪 ${stats.current}-day streak — keep the momentum!`
            : `✨ Great start! ${stats.current} day${stats.current > 1 ? 's' : ''} in a row.`}
        </p>
      )}

      {/* Monthly calendar */}
      <div className={`border-t ${divider} pt-4`}>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors ${
              darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            ‹
          </button>
          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            {monthLabel}
          </p>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors ${
              isCurrentMonth
                ? 'opacity-20 cursor-not-allowed'
                : darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            ›
          </button>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((l, i) => (
            <div key={i} className={`text-center text-[10px] font-semibold ${sub} py-1`}>{l}</div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />;
            const dateStr = cellDateStr(day);
            const isToday = isCurrentMonth && day === todayObj.getDate();
            const isMeditated = logSet.has(dateStr);
            let cellCls;
            if (isMeditated) {
              cellCls = 'bg-indigo-500 text-white font-semibold';
            } else if (isToday) {
              cellCls = darkMode
                ? 'ring-1 ring-indigo-400 text-indigo-300'
                : 'ring-1 ring-indigo-500 text-indigo-600';
            } else {
              cellCls = darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-500';
            }
            return (
              <div
                key={i}
                title={dateStr}
                className={`aspect-square rounded-lg flex items-center justify-center text-[11px] ${cellCls}`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className={`flex items-center gap-2 text-xs ${sub} mt-3`}>
          <div className={`w-3 h-3 rounded-sm ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`} />
          <span>No session</span>
          <div className="w-3 h-3 rounded-sm bg-indigo-500 ml-2" />
          <span>Meditated</span>
          <div className={`w-3 h-3 rounded-sm ring-1 ${darkMode ? 'ring-indigo-400' : 'ring-indigo-500'} ml-2`} />
          <span>Today</span>
        </div>
      </div>

      {/* Session log */}
      <div className={`border-t ${divider} pt-4 flex flex-col gap-2`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${sub}`}>Session Log</p>
        {sessions.length === 0 ? (
          <p className={`text-xs ${sub} italic`}>No sessions yet — complete a meditation to start your log.</p>
        ) : (
          <ul className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
            {[...sessions].reverse().map((s, i) => {
              const todayStr = toDateStr(new Date());
              const yesterdayStr = toDateStr(new Date(Date.now() - 86400000));
              const label =
                s.date === todayStr ? 'Today' :
                s.date === yesterdayStr ? 'Yesterday' :
                new Date(s.date + 'T00:00:00').toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
              const mins = Math.round(s.durationSeconds / 60);
              const time = new Date(s.completedAt).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
              return (
                <li
                  key={i}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{label}</span>
                  <span className={sub}>{time}</span>
                  <span className="text-indigo-400 font-semibold">{mins} min</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

