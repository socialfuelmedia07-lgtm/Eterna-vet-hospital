export const MEDICINE_NAME_PRESETS = [
  'Amoxicillin 300mg',
  'Pantop 20mg',
  'Onsior (Robenacoxib)',
  'Meloxicam',
  'Cephalexin',
  'Famotidine',
  'Marbofloxacin',
  'Itraconazole',
  'Prednisolone',
];

export const DOSAGE_PRESETS = ['1 tablet', 'Half tablet', 'Quarter tablet', '1 ml', '0.5 ml', '2 ml', 'As directed'];

export const FREQUENCY_PRESETS = [
  'Morning only',
  'Night only',
  'Morning + Night',
  'Morning + Afternoon + Night',
  'Every 12 hours',
  'Every 8 hours',
  'Once daily',
  'Twice daily',
  'Thrice daily',
  'SOS',
];

export const DURATION_PRESETS = ['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days', 'Until review'];

import type { PrescriptionFormValues } from './schema';

export const QUICK_TEMPLATES: { label: string; apply: () => Partial<PrescriptionFormValues> }[] = [
  {
    label: 'Skin allergy — draft',
    apply: () => ({
      diagnosis: 'Allergic dermatitis (suspected).',
      symptoms: 'Pruritus, erythema; no fever.',
      dietInstructions: 'Avoid known trigger proteins if identified; fresh water ad lib.',
    }),
  },
  {
    label: 'GI upset — draft',
    apply: () => ({
      diagnosis: 'Acute gastroenteritis (mild).',
      symptoms: 'Vomiting / soft stool; stable and alert.',
      treatmentNotes: 'Offer small frequent meals; monitor hydration.',
      followUp: 'Revisit if vomiting returns or lethargy worsens.',
    }),
  },
];
