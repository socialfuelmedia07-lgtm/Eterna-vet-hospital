import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config();

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DIGITAL_FILE_JWT_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const config = {
  port: Number(process.env.DIGITAL_FILE_API_PORT || 8787),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: process.env.DIGITAL_FILE_JWT_SECRET,
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'digital-file',
};
