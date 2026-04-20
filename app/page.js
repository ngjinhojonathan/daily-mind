'use client';

import { useState, useEffect, useCallback } from 'react';
import QuoteCard from './components/QuoteCard';
import FavouritesPanel from './components/FavouritesPanel';
import MeditationTimer from './components/MeditationTimer';
import StreakPanel from './components/StreakPanel';

const STORAGE_KEY = 'gratitude_favourites';
const THEME_KEY = 'gratitude_theme';
const REMINDER_KEY = 'gratitude_reminder_time';
const MEDITATION_REMINDER_KEY = 'meditation_reminder_time';

export default function Home() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favourites, setFavourites] = useState([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('gratitude');
  const [streakRefreshKey, setStreakRefreshKey] = useState(0);

  // Mark as mounted (client-side only)
  useEffect(() => { setMounted(true); }, []);

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light') setDarkMode(false);
  }, []);

  // Apply/remove dark class on <html> and persist
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Register service worker and reschedule reminder if one was saved
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        const savedTime = localStorage.getItem(REMINDER_KEY);
        if (savedTime && Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then(() => {
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'SCHEDULE_REMINDER',
                time: savedTime,
              });
            }
          });
        }
        const meditationTime = localStorage.getItem(MEDITATION_REMINDER_KEY);
        if (meditationTime && Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then(() => {
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'SCHEDULE_MEDITATION',
                time: meditationTime,
              });
            }
          });
        }
      });
    }
  }, []);

  // Load favourites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setFavourites(JSON.parse(saved));
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist favourites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  }, [favourites]);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quote?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Could not fetch quote');
      const data = await res.json();
      setQuote(data);
    } catch {
      setError('Could not load a quote. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial quote on mount
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Don't render until client has hydrated (prevents dark mode flash/blank)
  if (!mounted) return null;

  const isFavourited = quote
    ? favourites.some((f) => f.q === quote.q)
    : false;

  function toggleFavourite() {
    if (!quote) return;
    if (isFavourited) {
      setFavourites((prev) => prev.filter((f) => f.q !== quote.q));
    } else {
      setFavourites((prev) => [...prev, { q: quote.q }]);
    }
  }

  function removeFavourite(index) {
    setFavourites((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSessionComplete() {
    setStreakRefreshKey((k) => k + 1);
  }

  const bg = darkMode
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
    : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50';
  const headingColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const subColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const footerColor = darkMode ? 'text-gray-600' : 'text-gray-400';
  const tabBar = darkMode ? 'bg-gray-800' : 'bg-gray-100';
  const tabActive = darkMode ? 'bg-gray-700 text-gray-100 shadow-sm' : 'bg-white text-gray-800 shadow-sm';
  const tabInactive = darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600';
  const navLink = darkMode ? 'text-gray-400 hover:text-emerald-400' : 'text-gray-500 hover:text-emerald-600';

  return (
    <main className={`min-h-screen ${bg} flex flex-col items-center px-4 py-8 gap-5 transition-colors duration-300`}>
      {/* Personal mantra */}
      <p className={`text-base md:text-lg italic font-light tracking-wide ${darkMode ? 'text-emerald-300/70' : 'text-emerald-600/70'}`}>
        &ldquo;No big deal, I am good either ways&rdquo;
      </p>

      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className={`text-3xl md:text-4xl font-bold ${headingColor} tracking-tight`}>
            {activeTab === 'gratitude' ? '🌿 Gratitude' : '🧘 Meditation'}
          </h1>
          <p className={`${subColor} mt-1 text-sm`}>
            {activeTab === 'gratitude' ? 'A daily dose of uplifting wisdom' : 'Breathe, focus, and be present'}
          </p>
        </div>
        <button
          onClick={() => setDarkMode((v) => !v)}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`text-xl p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${darkMode ? 'text-yellow-300 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Tab switcher */}
      <div className={`flex rounded-2xl p-1 gap-1 w-full max-w-lg ${tabBar}`}>
        {[
          { id: 'gratitude', label: '🌿 Gratitude' },
          { id: 'meditation', label: '🧘 Meditation' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setShowFavourites(false); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === id ? tabActive : tabInactive}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl px-6 py-3 text-sm max-w-lg w-full text-center">
          {error}
        </div>
      )}

      {/* Gratitude tab */}
      {activeTab === 'gratitude' && (
        <div className="w-full max-w-lg flex flex-col items-center gap-4">
          {showFavourites ? (
            <FavouritesPanel
              favourites={favourites}
              onRemove={removeFavourite}
              onClose={() => setShowFavourites(false)}
              darkMode={darkMode}
            />
          ) : (
            <QuoteCard
              quote={quote}
              isFavourited={isFavourited}
              onToggleFavourite={toggleFavourite}
              onNewQuote={fetchQuote}
              loading={loading}
              darkMode={darkMode}
            />
          )}
          <button
            onClick={() => setShowFavourites((v) => !v)}
            className={`text-sm transition-colors ${navLink}`}
          >
            {showFavourites ? '← Back to quotes' : `❤️ Saved quotes (${favourites.length})`}
          </button>
        </div>
      )}

      {/* Meditation tab */}
      {activeTab === 'meditation' && (
        <div className="w-full max-w-lg flex flex-col gap-4 pb-4">
          <MeditationTimer
            darkMode={darkMode}
            onSessionComplete={handleSessionComplete}
          />
          <StreakPanel
            darkMode={darkMode}
            refreshKey={streakRefreshKey}
            embedded
          />
        </div>
      )}

      <footer className={`text-xs ${footerColor} mt-2`}>
        Curated uplifting quotes for your daily gratitude practice
      </footer>
    </main>
  );
}
