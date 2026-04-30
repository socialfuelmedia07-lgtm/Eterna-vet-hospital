const DIGIT_COUNT = 4;

export const normalizeDogNameToUsernameBase = (dogName: string): string => {
  const normalized = dogName.trim().toLowerCase().replace(/\s+/g, '_');
  return normalized || 'pet_parent';
};

const randomDigits = (length: number): string =>
  Array.from({ length }, () => Math.floor(Math.random() * 10).toString()).join('');

export const createUsernameCandidate = (base: string): string => `${base}_${randomDigits(DIGIT_COUNT)}`;

export const generateUniqueUsername = async (
  dogName: string,
  usernameExists: (username: string) => Promise<boolean>,
): Promise<string> => {
  const base = normalizeDogNameToUsernameBase(dogName);

  if (!(await usernameExists(base))) {
    return base;
  }

  // Retry indefinitely until a unique candidate is available.
  while (true) {
    const candidate = createUsernameCandidate(base);
    if (!(await usernameExists(candidate))) {
      return candidate;
    }
  }
};
