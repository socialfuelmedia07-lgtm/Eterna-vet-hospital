import React, { useCallback, useState } from 'react';
import type { PrescriptionFormValues } from '../../prescription/schema';
import { formatMealTiming } from '../../prescription/formatters';
import { EternaFallbackLetterhead } from './EternaFallbackLetterhead';

const TEMPLATE_SRC = '/prescription-template.png';

interface PrescriptionPreviewProps {
  values: PrescriptionFormValues;
  /** Assigned by parent so PDF/print can target the same DOM */
  sheetRef: React.RefObject<HTMLDivElement | null>;
}

const textBlock = 'font-[family-name:var(--font-body)] text-[clamp(9px,1.6vw,11px)] leading-snug text-[#0f172a]';

export const PrescriptionPreview: React.FC<PrescriptionPreviewProps> = ({ values, sheetRef }) => {
  const [templateOk, setTemplateOk] = useState<boolean | null>(null);

  const onImgError = useCallback(() => {
    setTemplateOk(false);
  }, []);

  const onImgLoad = useCallback(() => {
    setTemplateOk(true);
  }, []);

  const showImage = templateOk !== false;

  return (
    <div
      ref={sheetRef}
      className="relative mx-auto w-full max-w-[540px] overflow-hidden rounded-sm bg-white shadow-[0_20px_50px_rgba(15,23,42,0.14)] print:shadow-none"
      style={{ aspectRatio: '210 / 297' }}
    >
      {showImage ? (
        <>
          <img
            src={TEMPLATE_SRC}
            alt=""
            className="absolute inset-0 h-full w-full object-fill"
            onLoad={onImgLoad}
            onError={onImgError}
          />
          {templateOk === null ? (
            <span className="sr-only" aria-live="polite">
              Loading prescription template
            </span>
          ) : null}
        </>
      ) : (
        <EternaFallbackLetterhead />
      )}

      {/* Content zones — tuned for Eterna header/footer safe area; adjust % if swapping background art */}
      <div
        className={`absolute flex flex-col gap-[0.35rem] overflow-hidden ${showImage ? 'inset-[22%_9%_15.5%_9%]' : 'inset-[26%_9%_22%_9%]'}`}
        style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}
      >
        <div className={`flex shrink-0 justify-between gap-3 border-b border-slate-300/60 pb-2 ${textBlock}`}>
          <div>
            <span className="font-semibold text-[#0f2744]">Date: </span>
            <span>{values.date || '—'}</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-[#0f2744]">Pet: </span>
            <span>{values.petName || '—'}</span>
            {values.parentName?.trim() ? (
              <>
                <span className="mx-1 text-slate-400">|</span>
                <span className="font-semibold text-[#0f2744]">Parent: </span>
                <span>{values.parentName}</span>
              </>
            ) : null}
          </div>
        </div>

        <section className={`min-h-0 shrink-0 ${textBlock}`}>
          <p className="font-[family-name:var(--font-heading)] text-[10px] font-bold uppercase tracking-wide text-[#0f2744]">
            Symptoms
          </p>
          <p className="mt-0.5 whitespace-pre-wrap">{values.symptoms?.trim() || '—'}</p>
        </section>

        <section className={`min-h-0 shrink-0 ${textBlock}`}>
          <p className="font-[family-name:var(--font-heading)] text-[10px] font-bold uppercase tracking-wide text-[#0f2744]">
            Diagnosis
          </p>
          <p className="mt-0.5 whitespace-pre-wrap">{values.diagnosis?.trim() || '—'}</p>
        </section>

        <section className={`min-h-0 flex-1 overflow-y-auto ${textBlock}`}>
          <p className="font-[family-name:var(--font-heading)] text-[10px] font-bold uppercase tracking-wide text-[#0f2744]">
            Medicines
          </p>
          <ul className="mt-1 space-y-2">
            {values.medicines
              .filter((m) => m.drugLabel.trim())
              .map((m, idx) => {
                const meal = formatMealTiming(m.mealTiming);
                return (
                  <li key={m.id} className="rounded-md border border-slate-200/80 bg-white/60 p-2">
                    <p className="font-semibold text-[#0f2744]">
                      {idx + 1}. {m.drugLabel.trim()}
                    </p>
                    <div className="mt-1 space-y-0.5 pl-2 text-slate-800">
                      {m.amount?.trim() ? <p>- {m.amount.trim()}</p> : null}
                      {m.schedule?.trim() ? <p>- {m.schedule.trim()}</p> : null}
                      {meal ? <p>- {meal}</p> : null}
                      {m.duration?.trim() ? <p>- For {m.duration.trim()}</p> : null}
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>

        {values.dietInstructions?.trim() ? (
          <section className={`shrink-0 ${textBlock}`}>
            <p className="font-[family-name:var(--font-heading)] text-[10px] font-bold uppercase tracking-wide text-[#0f2744]">
              Diet
            </p>
            <p className="mt-0.5 whitespace-pre-wrap">{values.dietInstructions}</p>
          </section>
        ) : null}

        {values.treatmentNotes?.trim() ? (
          <section className={`shrink-0 ${textBlock}`}>
            <p className="font-[family-name:var(--font-heading)] text-[10px] font-bold uppercase tracking-wide text-[#0f2744]">
              Treatment notes
            </p>
            <p className="mt-0.5 whitespace-pre-wrap">{values.treatmentNotes}</p>
          </section>
        ) : null}

        {values.followUp?.trim() ? (
          <section className={`shrink-0 ${textBlock}`}>
            <p className="font-[family-name:var(--font-heading)] text-[10px] font-bold uppercase tracking-wide text-[#0f2744]">
              Follow-up
            </p>
            <p className="mt-0.5 whitespace-pre-wrap">{values.followUp}</p>
          </section>
        ) : null}

        <div className={`mt-auto flex shrink-0 justify-end border-t border-slate-300/50 pt-2 ${textBlock}`}>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-[#0f2744]">Veterinarian</p>
            <p className="min-h-[1.1rem] whitespace-pre-wrap">{values.veterinarianName?.trim() || '____________________'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
