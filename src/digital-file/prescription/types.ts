export type MealTiming = 'before' | 'after' | 'with' | '';

export interface MedicineLine {
  id: string;
  drugLabel: string;
  amount: string;
  schedule: string;
  mealTiming: MealTiming;
  duration: string;
}

/** Internal form + live preview + PDF payload */
export interface PrescriptionPayload {
  date: string;
  petName: string;
  parentName: string;
  symptoms: string;
  diagnosis: string;
  medicines: MedicineLine[];
  dietInstructions: string;
  treatmentNotes: string;
  followUp: string;
  veterinarianName: string;
}
