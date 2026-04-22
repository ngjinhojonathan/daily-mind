export default function QuoteCard({ quote, isFavourited, onToggleFavourite, onNewQuote, loading, darkMode }) {
  const card = darkMode ? 'bg-gray-800' : 'bg-white';
  const quoteText = darkMode ? 'text-gray-100' : 'text-gray-800';
  const loadingText = darkMode ? 'text-gray-400' : 'text-gray-400';
  const divider = darkMode ? 'border-gray-700' : 'border-gray-100';
  const saveBtn = darkMode
    ? 'bg-rose-900/40 text-rose-300 hover:bg-rose-900/60'
    : 'bg-rose-50 text-rose-500 hover:bg-rose-100';

  return (
    <div className={`${card} rounded-3xl shadow-xl p-8 md:p-12 max-w-2xl w-full flex flex-col gap-6 transition-colors duration-300`}>
      {/* Quote text */}
      <div className="min-h-[120px] flex items-center justify-center">
        {loading ? (
          <div className="flex gap-2 items-center text-emerald-400">
            <span className="animate-spin text-2xl">✦</span>
            <span className={`text-lg ${loadingText}`}>Finding inspiration...</span>
          </div>
        ) : (
          <blockquote className="text-center">
            <p className={`text-xl md:text-2xl font-medium ${quoteText} leading-relaxed italic`}>
              &ldquo;{quote?.q}&rdquo;
            </p>
          </blockquote>
        )}
      </div>

      {/* Actions */}
      <div className={`flex items-center justify-center gap-4 pt-2 border-t ${divider}`}>
        <button
          onClick={onToggleFavourite}
          disabled={loading || !quote}
          title={isFavourited ? 'Remove from favourites' : 'Save to favourites'}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:scale-105 active:scale-95 ${saveBtn}`}
        >
          <span className="text-lg">{isFavourited ? '❤️' : '🤍'}</span>
          {isFavourited ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={onNewQuote}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:scale-105 active:scale-95
            bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200"
        >
          <span>✨</span>
          New Quote
        </button>
      </div>
    </div>
  );
}
