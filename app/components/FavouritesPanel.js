export default function FavouritesPanel({ favourites, onRemove, onClose, darkMode }) {
  const card = darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-400';
  const item = darkMode ? 'bg-gray-700 text-gray-200' : 'bg-emerald-50 text-gray-700';

  return (
    <div className={`${card} rounded-3xl shadow-xl p-6 max-w-2xl w-full flex flex-col gap-4 max-h-[70vh] transition-colors duration-300`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          ❤️ Saved Quotes <span className={`text-sm font-normal ${sub}`}>({favourites.length})</span>
        </h2>
        <button
          onClick={onClose}
          className={`${sub} hover:text-rose-400 transition-colors text-xl leading-none`}
          title="Close"
        >
          ✕
        </button>
      </div>

      {favourites.length === 0 ? (
        <p className={`text-center ${sub} py-8 text-sm`}>
          No saved quotes yet. Hit 🤍 on a quote to save it!
        </p>
      ) : (
        <ul className="overflow-y-auto flex flex-col gap-3 pr-1">
          {favourites.map((fav, i) => (
            <li
              key={i}
              className={`${item} rounded-2xl p-4 flex flex-col gap-2 group`}
            >
              <p className="italic text-sm leading-relaxed">&ldquo;{fav.q}&rdquo;</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onRemove(i)}
                  className="text-xs text-rose-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 ml-auto"
                  title="Remove"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
