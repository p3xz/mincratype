interface Props {
  onPrivacy: () => void;
}

const SOCIALS = [
  { label: "GITHUB", href: "https://github.com/p3xz" },
  { label: "LINKEDIN", href: "https://linkedin.com/in/namish-yadav-639769408" },
  { label: "INSTAGRAM", href: "https://instagram.com/nam7sh" },
  { label: "PORTFOLIO", href: "https://namishhh.vercel.app" },
];

export default function Footer({ onPrivacy }: Props) {
  return (
    <footer className="w-full border-t-2 border-cave-700 mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-5 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <button
            onClick={onPrivacy}
            className="pixel-text text-[9px] text-grass-400 hover:text-grass-300"
          >
            PRIVACY
          </button>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="pixel-text text-[9px] text-stone-500 hover:text-grass-300"
            >
              {s.label}
            </a>
          ))}
        </div>
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
