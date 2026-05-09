import React from 'react';

/** Used when `/prescription-template.png` is missing or fails to load — keeps clinic branding consistent. */
export const EternaFallbackLetterhead: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 flex flex-col text-[#0f2744]">
    <header className="relative shrink-0 border-b-4 border-[#f59e0b] bg-[#0f2744] px-[6%] py-3 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
            <span className="text-2xl" aria-hidden>
              ✚
            </span>
          </div>
          <div>
            <p className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-wide text-white">ETERNA</p>
            <p className="text-sm font-semibold text-[#fb923c]">PET HOSPITAL</p>
          </div>
        </div>
        <div className="max-w-[52%] text-right text-[10px] leading-snug sm:text-[11px]">
          <p>
            <span className="font-semibold text-[#fb923c]">DR PAUNAS JOSHI (5415)</span>
            <br />
            M.V.Sc Vet., Internal Medicine
          </p>
          <p className="mt-1">
            <span className="font-semibold text-[#fb923c]">DR YAMINI THAKUR (1228)</span>
            <br />
            M.V.Sc Vet., Surgery and Radiology (Ophthalmology)
          </p>
        </div>
      </div>
    </header>

    <div className="pointer-events-none flex flex-1 opacity-[0.07]">
      <div className="m-auto flex gap-6 text-5xl font-light">🐾</div>
    </div>

    <footer className="relative mt-auto shrink-0 bg-[#0f2744] px-[6%] py-3 text-[9px] leading-relaxed text-white sm:text-[10px]">
      <div className="mb-1 border-t border-[#fb923c] pt-2">
        <div className="flex flex-wrap justify-between gap-2">
          <span>492, Avadh, Opp Milan Park, Bodakdev</span>
          <span>Next to Pupparaz! Club, VIP Road, South Bopal</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-white/95">
        <span>9974930505 / 9819851792</span>
        <span>anquiry@eternapethospital.com</span>
        <span>www.eternapethospital.in</span>
      </div>
    </footer>
  </div>
);
