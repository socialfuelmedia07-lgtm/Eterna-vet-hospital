import jwt from 'jsonwebtoken';
import { config } from './config.js';

export const toSafeExt = (filename) => {
  const ext = filename.includes('.') ? filename.split('.').pop() : 'bin';
  return String(ext).toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
};

export const normalizeDogNameToUsernameBase = (dogName) => {
  const normalized = String(dogName || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return normalized || 'pet_parent';
};

export const createCandidate = (base) =>
  `${base}_${Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')}`;

export const signSessionToken = (user) =>
  jwt.sign({ user_id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: '30d',
  });
