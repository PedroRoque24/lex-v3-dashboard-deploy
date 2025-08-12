import { memoryUrl } from '../lib/api';
export default function SidebarBrand() {
  return (
    <div className="px-5 pt-6 pb-4 select-none">
      {/* Logo (tight viewBox; path preserved) */}
      <img
        src="/assets/Lexlogo.svg?v=5"
        alt="Lex logo"
        width="340"
        height="340"
        className="block mb-5"
        loading="eager"
        decoding="async"
      />

      <p className="text-2xl md:text-3xl font-extrabold tracking-wide text-white/95 leading-tight">
        Learning. Empathy. eXpertise.
      </p>

      <p className="mt-3 text-base md:text-lg leading-7 text-white/80 lex-ethos">
        Inspired by “Alexis,” from the Greek ἄλεξις — meaning protector and defender —
        <span className="font-semibold text-white/90"> Lex </span>
        is an AI that learns continuously, acts with empathy, and delivers expertise,
        safeguarding those it serves.
      </p>
    </div>
  );
}