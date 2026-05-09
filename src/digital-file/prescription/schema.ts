import { z } from 'zod';

const mealTiming = z.enum(['before', 'after', 'with', '']);

export const medicineLineSchema = z.object({
  id: z.string(),
  drugLabel: z.string().min(1, 'Medicine name is required'),
  amount: z.string().optional().default(''),
  schedule: z.string().optional().default(''),
  mealTiming,
  duration: z.string().optional().default(''),
});

export const prescriptionFormSchema = z.object({
  date: z.string().min(1),
  petName: z.string().min(1, 'Pet name is required'),
  parentName: z.string().optional().default(''),
  symptoms: z.string().optional().default(''),
  diagnosis: z.string().optional().default(''),
  medicines: z.array(medicineLineSchema).min(1, 'Add at least one medicine line'),
  dietInstructions: z.string().optional().default(''),
  treatmentNotes: z.string().optional().default(''),
  followUp: z.string().optional().default(''),
  veterinarianName: z.string().optional().default(''),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;
