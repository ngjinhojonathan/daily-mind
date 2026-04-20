'use client';

import { useState, useEffect } from 'react';

const REMINDER_KEY = 'gratitude_reminder_time';

export default function ReminderSettings({ onClose, darkMode }) {
  const [time, setTime] = useState('08:00');
  const [permission, setPermission] = useState('default');
  const [enabled, setEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
    const stored = localStorage.getItem(REMINDER_KEY);
    if (stored) {
      setTime(stored);
      setEnabled(true);
    }
  }, []);

  async function requestAndEnable() {
    if (typeof Notification === 'undefined') return;
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
      setPermission(perm);
    }
    if (perm !== 'granted') return;

    localStorage.setItem(REMINDER_KEY, time);
    setEnabled(true);
    scheduleWithSW(time);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function disable() {
    localStorage.removeItem(REMINDER_KEY);
    setEnabled(false);
    cancelWithSW();
  }

  function scheduleWithSW(timeStr) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SCHEDULE_REMINDER', time: timeStr });
    }
  }

  function cancelWithSW() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CANCEL_REMINDER' });
    }
  }

  const card = darkMode
    ? 'bg-gray-800 text-gray-100'
    : 'bg-white text-gray-800';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const input = darkMode
    ? 'bg-gray-700 border-gray-600 text-gray-100'
    : 'bg-gray-50 border-gray-200 text-gray-800';

  return (
    <div className={`${card} rounded-3xl shadow-xl p-6 max-w-md w-full flex flex-col gap-5`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">🔔 Daily Reminder</h2>
        <button onClick={onClose} className={`${sub} hover:text-rose-400 transition-colors text-xl leading-none`}>✕</button>
      </div>

      <p className={`text-sm ${sub}`}>
        Get a daily browser notification to pause and practise gratitude.
      </p>

      {permission === 'denied' ? (
        <div className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 rounded-2xl px-4 py-3 text-sm">
          Notifications are blocked in your browser settings. Please enable them for this site and try again.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <label className={`text-sm font-medium ${sub}`}>Remind me daily at</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`${input} border rounded-xl px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            />
          </div>

          <div className="flex gap-3">
            {enabled ? (
              <>
                <button
                  onClick={requestAndEnable}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                >
                  {saved ? '✓ Saved!' : 'Update time'}
                </button>
                <button
                  onClick={disable}
                  className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
                >
                  Turn off
                </button>
              </>
            ) : (
              <button
                onClick={requestAndEnable}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95"
              >
                Enable reminder
              </button>
            )}
          </div>

          {enabled && (
            <p className="text-xs text-emerald-500 text-center">
              ✓ Reminder set for {time} daily
            </p>
          )}
        </>
      )}
    </div>
  );
}
