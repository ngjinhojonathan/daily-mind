'use client';

import { useState, useEffect, useRef } from 'react';

const MEDITATION_REMINDER_KEY = 'meditation_reminder_time';
const MEDITATION_LOG_KEY = 'meditation_log';
const MEDITATION_SESSIONS_KEY = 'meditation_sessions';

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DURATIONS = [
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
];

// Breathing cycle: inhale 4s, hold 2s, exhale 4s, hold 3s = 13s total (matches CSS)
const PHASES = [
  { label: 'Inhale',  duration: 4 },
  { label: 'Hold',    duration: 2 },
  { label: 'Exhale',  duration: 4 },
  { label: 'Rest',    duration: 3 },
];

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export default function MeditationTimer({ onClose, darkMode, onSessionComplete }) {
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[1]);
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS[1].seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  // Reminder state
  const [reminderTime, setReminderTime] = useState('07:00');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [permission, setPermission] = useState('default');
  const [reminderSaved, setReminderSaved] = useState(false);

  // Breathing phase
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phaseElapsed = useRef(0);

  // Timer tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return s - 1;
      });

      // Advance breathing phase
      phaseElapsed.current += 1;
      if (phaseElapsed.current >= PHASES[phaseIndex].duration) {
        phaseElapsed.current = 0;
        setPhaseIndex((p) => (p + 1) % PHASES.length);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running, phaseIndex]);

  function handleStart() {
    setDone(false);
    setRunning(true);
    phaseElapsed.current = 0;
    setPhaseIndex(0);
  }

  function handlePause() { setRunning(false); }

  function handleReset() {
    setRunning(false);
    setDone(false);
    setSecondsLeft(selectedDuration.seconds);
    phaseElapsed.current = 0;
    setPhaseIndex(0);
  }

  // Log session to localStorage and notify parent when timer completes
  useEffect(() => {
    if (!done) return;
    try {
      const todayStr = toDateStr(new Date());
      // Date-only log for streak heatmap
      const rawLog = localStorage.getItem(MEDITATION_LOG_KEY);
      const logArr = rawLog ? JSON.parse(rawLog) : [];
      if (!logArr.includes(todayStr)) logArr.push(todayStr);
      localStorage.setItem(MEDITATION_LOG_KEY, JSON.stringify(logArr));
      // Detailed session record
      const rawSessions = localStorage.getItem(MEDITATION_SESSIONS_KEY);
      const sessions = rawSessions ? JSON.parse(rawSessions) : [];
      sessions.push({
        date: todayStr,
        durationSeconds: selectedDuration.seconds,
        completedAt: new Date().toISOString(),
      });
      localStorage.setItem(MEDITATION_SESSIONS_KEY, JSON.stringify(sessions));
    } catch {}
    if (onSessionComplete) onSessionComplete();
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  function pickDuration(d) {
    setSelectedDuration(d);
    setSecondsLeft(d.seconds);
    setRunning(false);
    setDone(false);
    phaseElapsed.current = 0;
    setPhaseIndex(0);
  }

  // Reminder logic
  useEffect(() => {
    if (typeof Notification !== 'undefined') setPermission(Notification.permission);
    const stored = localStorage.getItem(MEDITATION_REMINDER_KEY);
    if (stored) { setReminderTime(stored); setReminderEnabled(true); }
  }, []);

  async function enableReminder() {
    if (typeof Notification === 'undefined') return;
    let perm = Notification.permission;
    if (perm === 'default') { perm = await Notification.requestPermission(); setPermission(perm); }
    if (perm !== 'granted') return;
    localStorage.setItem(MEDITATION_REMINDER_KEY, reminderTime);
    setReminderEnabled(true);
    sendToSW({ type: 'SCHEDULE_MEDITATION', time: reminderTime });
    setReminderSaved(true);
    setTimeout(() => setReminderSaved(false), 2000);
  }

  function disableReminder() {
    localStorage.removeItem(MEDITATION_REMINDER_KEY);
    setReminderEnabled(false);
    sendToSW({ type: 'CANCEL_MEDITATION' });
  }

  function sendToSW(msg) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(msg);
    }
  }

  const card = darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800';
  const sub  = darkMode ? 'text-gray-400' : 'text-gray-500';
  const divider = darkMode ? 'border-gray-700' : 'border-gray-100';
  const chipBase = 'px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95';
  const chipActive = 'bg-indigo-500 text-white shadow-md';
  const chipInactive = darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600';
  const input = darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800';

  const circleColor = darkMode ? 'bg-indigo-500/30' : 'bg-indigo-200';
  const innerCircle = darkMode ? 'bg-indigo-400/60' : 'bg-indigo-400';
  const phaseLabel = PHASES[phaseIndex].label;

  const progress = 1 - secondsLeft / selectedDuration.seconds;

  return (
    <div className={`${card} rounded-3xl shadow-xl p-6 w-full flex flex-col gap-5 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">🧘 Meditation</h2>
        {onClose && (
          <button onClick={onClose} className={`${sub} hover:text-rose-400 transition-colors text-xl leading-none`}>✕</button>
        )}
      </div>

      {/* Duration picker */}
      <div className="flex gap-2 justify-center">
        {DURATIONS.map((d) => (
          <button
            key={d.label}
            onClick={() => pickDuration(d)}
            disabled={running}
            className={`${chipBase} ${selectedDuration.label === d.label ? chipActive : chipInactive} disabled:opacity-50`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Breathing circle */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className={`relative w-32 h-32 rounded-full ${circleColor} flex items-center justify-center`}>
          <div className={`w-20 h-20 rounded-full ${innerCircle} ${running ? 'animate-breathe' : ''} flex items-center justify-center transition-all`}>
            <span className="text-white text-xs font-semibold tracking-wide">
              {done ? '✓' : running ? phaseLabel : ''}
            </span>
          </div>
        </div>

        {/* Countdown */}
        <span className={`text-4xl font-mono font-bold tabular-nums ${done ? 'text-indigo-500' : ''}`}>
          {done ? 'Done! 🎉' : formatTime(secondsLeft)}
        </span>

        {/* Progress bar */}
        <div className={`w-full h-1.5 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} overflow-hidden`}>
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-1000"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {!running && !done && (
          <button
            onClick={handleStart}
            className="px-8 py-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            {secondsLeft === selectedDuration.seconds ? '▶ Start' : '▶ Resume'}
          </button>
        )}
        {running && (
          <button
            onClick={handlePause}
            className="px-8 py-2 rounded-full bg-amber-400 hover:bg-amber-500 text-white text-sm font-medium transition-all hover:scale-105 active:scale-95"
          >
            ⏸ Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          ↺ Reset
        </button>
      </div>

      {/* Reminder section */}
      <div className={`border-t ${divider} pt-4 flex flex-col gap-3`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${sub}`}>Daily Meditation Reminder</p>

        {permission === 'denied' ? (
          <p className="text-xs text-rose-500">Notifications are blocked. Enable them in browser settings.</p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className={`${input} border rounded-xl px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400`}
              />
              {reminderEnabled ? (
                <div className="flex gap-2">
                  <button onClick={enableReminder} className="text-xs px-3 py-1.5 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-all">
                    {reminderSaved ? '✓' : 'Update'}
                  </button>
                  <button onClick={disableReminder} className="text-xs px-3 py-1.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all">
                    Off
                  </button>
                </div>
              ) : (
                <button onClick={enableReminder} className="text-xs px-3 py-1.5 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-all">
                  Enable
                </button>
              )}
            </div>
            {reminderEnabled && (
              <p className="text-xs text-indigo-500">✓ Meditation reminder set for {reminderTime}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
