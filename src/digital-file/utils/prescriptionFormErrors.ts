import type { FieldErrors } from 'react-hook-form';
import type { PrescriptionFormValues } from '../prescription/schema';

export function getFirstPrescriptionFormError(errors: FieldErrors<PrescriptionFormValues>): string {
  const direct = [errors.date?.message, errors.petName?.message].find(Boolean);
  if (direct) return String(direct);

  const meds = errors.medicines;
  if (meds && typeof meds === 'object') {
    if (Array.isArray(meds)) {
      for (const row of meds) {
        if (!row || typeof row !== 'object') continue;
        const msg = row.drugLabel?.message ?? row.root?.message;
        if (msg) return String(msg);
      }
    } else if ('message' in meds && meds.message) {
      return String(meds.message);
    }
  }

  const root = errors.root?.message;
  if (root) return String(root);

  return 'Please fill required fields (date, pet name, at least one medicine with a name).';
}
