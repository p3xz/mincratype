interface Props {
  onClose: () => void;
}

export default function PrivacyNote({ onClose }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16">
      <p className="pixel-text text-[10px] text-stone-500 mb-2">PRIVACY NOTE</p>
      <h2 className="pixel-text text-xl text-stone-200 mb-6">HOW YOUR DATA IS HANDLED</h2>

      <div className="space-y-5 text-[13px] leading-relaxed text-stone-400 font-type">
        <p>
          MINCRATYPE runs entirely in your browser. There is no backend, no user
          accounts, and no tracking. Nothing you type is sent anywhere.
        </p>
        <p>
          Your personal bests and settings (sound toggle, last used mode) are
          saved in your browser's localStorage. This data never leaves your
          device. Clearing your browser storage resets everything.
        </p>
        <p>
          This site sets no cookies. There is no analytics beacon and no
          third-party tracking of any kind.
        </p>
        <p>
          The only network requests are the ones that load the site itself, like
          any static website.
        </p>
      </div>

      <button
        onClick={onClose}
        className="pixel-text mt-10 text-[10px] text-grass-400 hover:text-grass-300 border-2 border-cave-700 hover:border-grass-500 px-4 py-2 transition-colors"
      >
        &larr; BACK TO TEST
      </button>
    </div>
  );
}
