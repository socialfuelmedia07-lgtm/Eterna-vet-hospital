import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import type { AdminPetDetails } from '../../types/adminDashboard';
import { uploadMedicalRecord } from '../../api/adminDashboardApi';
import { DOSAGE_PRESETS, DURATION_PRESETS, FREQUENCY_PRESETS, MEDICINE_NAME_PRESETS, QUICK_TEMPLATES } from '../../prescription/presets';
import { newMedicineRow } from '../../prescription/formatters';
import { prescriptionFormSchema, type PrescriptionFormValues } from '../../prescription/schema';
import { PrescriptionPreview } from './PrescriptionPreview';
import { getFirstPrescriptionFormError } from '../../utils/prescriptionFormErrors';
import {
  downloadPrescriptionPdf,
  prescriptionPdfBlob,
  printPrescription,
  triggerPdfBlobDownload,
} from '../../utils/prescriptionPdf';

interface PrescriptionWorkspaceProps {
  pet: AdminPetDetails;
  token: string;
  /** Refresh pet details / records after attaching PDF */
  onAttached: () => void | Promise<void>;
  onAttachError: (message: string) => void;
  /** Clears parent error banners after a successful save */
  onSaved?: () => void;
}

const todayIsoDate = (): string => new Date().toISOString().slice(0, 10);

export const PrescriptionWorkspace: React.FC<PrescriptionWorkspaceProps> = ({ pet, token, onAttached, onAttachError, onSaved }) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [exportTried, setExportTried] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [rxNotice, setRxNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const methods = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    mode: 'onChange',
    defaultValues: {
      date: todayIsoDate(),
      petName: pet.dogName,
      parentName: pet.parentName,
      symptoms: '',
      diagnosis: '',
      medicines: [newMedicineRow()],
      dietInstructions: '',
      treatmentNotes: '',
      followUp: '',
      veterinarianName: '',
    },
  });

  const { control, handleSubmit, reset, formState } = methods;

  useEffect(() => {
    setRxNotice(null);
    reset({
      date: todayIsoDate(),
      petName: pet.dogName,
      parentName: pet.parentName,
      symptoms: '',
      diagnosis: '',
      medicines: [newMedicineRow()],
      dietInstructions: '',
      treatmentNotes: '',
      followUp: '',
      veterinarianName: '',
    });
  }, [pet.id, pet.dogName, pet.parentName, reset]);

  const values = useWatch({ control }) as PrescriptionFormValues;

  const rxFileBaseName = (data: PrescriptionFormValues): string => {
    const safePet = data.petName.replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').slice(0, 48) || 'Pet';
    return `Eterna_Rx_${safePet}_${data.date}`;
  };

  const onDownloadPdf = (): void => {
    setRxNotice(null);
    setExportTried(true);
    if (!sheetRef.current) return;
    void handleSubmit(
      async (data) => {
        await downloadPrescriptionPdf(sheetRef.current as HTMLDivElement, `${rxFileBaseName(data)}.pdf`);
      },
      (errs) => setRxNotice({ kind: 'err', text: getFirstPrescriptionFormError(errs) }),
    )();
  };

  /** Generate PDF once → upload as prescription history → download same file for the vet. */
  const onSavePdfToPetHistory = (): void => {
    setRxNotice(null);
    onAttachError('');
    setExportTried(true);
    if (!sheetRef.current) return;
    void handleSubmit(
      async (data) => {
        setAttaching(true);
        try {
          const el = sheetRef.current as HTMLDivElement;
          const blob = await prescriptionPdfBlob(el);
          if (!blob || blob.size < 256) {
            throw new Error('PDF capture failed or file was empty. Wait for the preview to finish loading, then try again.');
          }
          const fname = `${rxFileBaseName(data)}.pdf`;
          const file = new File([blob], fname, { type: 'application/pdf', lastModified: Date.now() });
          const desc = `Prescription PDF — ${data.date}${data.diagnosis?.trim() ? ` — ${data.diagnosis.trim().slice(0, 160)}` : ''}`;
          await uploadMedicalRecord(token, pet.id, 'prescription', file, desc);
          triggerPdfBlobDownload(blob, fname);
          await onAttached();
          onSaved?.();
          setRxNotice({
            kind: 'ok',
            text: 'Saved to this pet’s medical history as a prescription PDF. Parents see it under medication / prescriptions.',
          });
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Could not save prescription PDF.';
          setRxNotice({ kind: 'err', text: msg });
          onAttachError(msg);
        } finally {
          setAttaching(false);
        }
      },
      (errs) => {
        const msg = getFirstPrescriptionFormError(errs);
        setRxNotice({ kind: 'err', text: msg });
        onAttachError(msg);
      },
    )();
  };

  const showValidationHint = exportTried && !formState.isValid;

  return (
    <FormProvider {...methods}>
      <div className="prescription-workspace-grid">
        <PrescriptionFormColumn />
        <div className="prescription-preview-column">
          <div className="prescription-preview-toolbar no-print">
            <span className="text-xs font-medium text-slate-500">Live preview · saves as PDF to medication history</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary px-4 py-2 text-sm"
                disabled={attaching}
                onClick={onSavePdfToPetHistory}
              >
                {attaching ? 'Saving…' : 'Save PDF to pet history'}
              </button>
              <button type="button" className="btn btn-secondary px-4 py-2 text-sm" onClick={onDownloadPdf}>
                Download PDF only
              </button>
              <button type="button" className="btn btn-secondary px-4 py-2 text-sm" onClick={() => sheetRef.current && printPrescription(sheetRef.current)}>
                Print
              </button>
            </div>
          </div>
          <div className="prescription-preview-scroll">
            <PrescriptionPreview values={values} sheetRef={sheetRef} />
          </div>
          {rxNotice ? (
            <p className={`no-print mt-2 text-sm ${rxNotice.kind === 'ok' ? 'font-medium text-emerald-800' : 'text-red-600'}`}>{rxNotice.text}</p>
          ) : showValidationHint ? (
            <p className="no-print mt-2 text-sm text-red-600">Complete required fields (including at least one medicine name) before saving.</p>
          ) : null}
        </div>
      </div>
    </FormProvider>
  );
};

const PrescriptionFormColumn: React.FC = () => {
  const { control, register, setValue } = useFormContext<PrescriptionFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'medicines' });

  return (
    <div className="flex flex-col gap-4">
      <datalist id="med-names">
        {MEDICINE_NAME_PRESETS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id="dosages">
        {DOSAGE_PRESETS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
      <datalist id="frequencies">
        {FREQUENCY_PRESETS.map((f) => (
          <option key={f} value={f} />
        ))}
      </datalist>
      <datalist id="durations">
        {DURATION_PRESETS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quick drafts</span>
        {QUICK_TEMPLATES.map((tpl) => (
          <button
            key={tpl.label}
            type="button"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => {
              const patch = tpl.apply();
              Object.entries(patch).forEach(([k, v]) => {
                if (v !== undefined) setValue(k as keyof PrescriptionFormValues, v as never, { shouldDirty: true });
              });
            }}
          >
            {tpl.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Date
          <input type="date" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register('date')} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Pet name
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register('petName')} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 sm:col-span-2">
          Parent name
          <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register('parentName')} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Symptoms
        <textarea className="min-h-[72px] rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Chief complaints, onset, severity..." {...register('symptoms')} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Diagnosis
        <textarea className="min-h-[72px] rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register('diagnosis')} />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-slate-800">Medicines</h4>
          <button
            type="button"
            className="rounded-full bg-[#0f2744] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e3a5f]"
            onClick={() => append(newMedicineRow())}
          >
            + Add line
          </button>
        </div>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500">Line {index + 1}</span>
                {fields.length > 1 ? (
                  <button type="button" className="text-slate-400 hover:text-red-600" onClick={() => remove(index)} aria-label="Remove medicine line">
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:col-span-2">
                  Medicine
                  <input className="rounded-lg border border-white bg-white px-2 py-1.5 text-sm" list="med-names" {...register(`medicines.${index}.drugLabel`)} />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Dose
                  <input className="rounded-lg border border-white bg-white px-2 py-1.5 text-sm" list="dosages" {...register(`medicines.${index}.amount`)} />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Frequency
                  <input className="rounded-lg border border-white bg-white px-2 py-1.5 text-sm" list="frequencies" {...register(`medicines.${index}.schedule`)} />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Meal timing
                  <select className="rounded-lg border border-white bg-white px-2 py-1.5 text-sm" {...register(`medicines.${index}.mealTiming`)}>
                    <option value="">—</option>
                    <option value="before">Before food</option>
                    <option value="after">After food</option>
                    <option value="with">With food</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Duration
                  <input className="rounded-lg border border-white bg-white px-2 py-1.5 text-sm" list="durations" {...register(`medicines.${index}.duration`)} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Diet instructions
        <textarea className="min-h-[56px] rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register('dietInstructions')} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Treatment notes
        <textarea className="min-h-[72px] rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register('treatmentNotes')} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Follow-up
        <textarea className="min-h-[56px] rounded-lg border border-slate-200 px-3 py-2 text-sm" {...register('followUp')} />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Veterinarian (signature line)
        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Printed name for signature area" {...register('veterinarianName')} />
      </label>
    </div>
  );
};
