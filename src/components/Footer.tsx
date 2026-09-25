export default function Footer() {
  return (
    <footer className="w-full border-t-2 border-cave-700 mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="pixel-text text-[9px] text-stone-500">
          CREATED BY{" "}
          <a
            href="https://insidcode.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="text-grass-400 hover:text-grass-300"
          >
            NAMISH YADAV
          </a>
        </p>
        <p className="text-[11px] text-stone-600 font-type">
          A fan-made parody concept. Not affiliated with Mojang or Microsoft.
        </p>
      </div>
    </footer>
  );
}
