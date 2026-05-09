import type { MealTiming, MedicineLine } from './types';

export function formatMealTiming(m: MealTiming): string {
  if (m === 'before') return 'Before Food';
  if (m === 'after') return 'After Food';
  if (m === 'with') return 'With Food';
  return '';
}

export function formatMedicineBlock(lines: MedicineLine[], startIndex = 1): string {
  return lines
    .filter((l) => l.drugLabel.trim())
    .map((line, idx) => {
      const n = startIndex + idx;
      const meal = formatMealTiming(line.mealTiming);
      const parts = [
        `${n}. ${line.drugLabel.trim()}`,
        line.amount.trim() ? `   - ${line.amount.trim()}` : '',
        line.schedule.trim() ? `   - ${line.schedule.trim()}` : '',
        meal ? `   - ${meal}` : '',
        line.duration.trim() ? `   - For ${line.duration.trim()}` : '',
      ].filter(Boolean);
      return parts.join('\n');
    })
    .join('\n\n');
}

export function newMedicineRow(): MedicineLine {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `med-${Date.now()}-${Math.random()}`,
    drugLabel: '',
    amount: '',
    schedule: '',
    mealTiming: '',
    duration: '',
  };
}
