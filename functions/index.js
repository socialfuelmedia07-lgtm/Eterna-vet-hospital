const functions = require('firebase-functions');
const cors = require('cors');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { z } = require('zod');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '2mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

const getCfg = () => {
  const cfg = functions.config();
  const supabaseUrl = cfg.supabase && cfg.supabase.url;
  const serviceRoleKey = cfg.supabase && cfg.supabase.service_role_key;
  const jwtSecret = cfg.digitalfile && cfg.digitalfile.jwt_secret;
  const bucket = (cfg.storage && cfg.storage.bucket) || 'digital-file';

  if (!supabaseUrl || !serviceRoleKey || !jwtSecret) {
    throw new Error('Missing function config: supabase.url, supabase.service_role_key, digitalfile.jwt_secret');
  }

  return { supabaseUrl, serviceRoleKey, jwtSecret, bucket };
};

const supabaseAdmin = () => {
  const { supabaseUrl, serviceRoleKey } = getCfg();
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const signSessionToken = (user) => {
  const { jwtSecret } = getCfg();
  return jwt.sign({ user_id: user.id, role: user.role }, jwtSecret, { expiresIn: '30d' });
};

const buildSessionResponse = (userRow) => ({
  token: signSessionToken(userRow),
  user: { id: userRow.id, username: userRow.username, role: userRow.role },
});

const getErrorMessage = (error, fallback) => {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return fallback;
};

const getBearerToken = (headerValue) => {
  if (!headerValue || !headerValue.startsWith('Bearer ')) return null;
  return headerValue.slice('Bearer '.length);
};

const requireAuth = (req, res, next) => {
  try {
    const { jwtSecret } = getCfg();
    const token = getBearerToken(req.headers.authorization);
    if (!token) return res.status(401).json({ message: 'Missing bearer token.' });
    const payload = jwt.verify(token, jwtSecret);
    req.auth = { userId: payload.user_id, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.auth || req.auth.role !== role) return res.status(403).json({ message: 'Forbidden.' });
  return next();
};

const normalizeDogNameToUsernameBase = (dogName) => {
  const normalized = String(dogName || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return normalized || 'pet_parent';
};

const createCandidate = (base) =>
  `${base}_${Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')}`;

const generateUniqueUsername = async (dogName) => {
  const base = normalizeDogNameToUsernameBase(dogName);
  const sb = supabaseAdmin();
  const checkExists = async (username) => {
    const { data, error } = await sb.from('users').select('id').eq('username', username).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return Boolean(data);
  };
  if (!(await checkExists(base))) return base;
  for (;;) {
    const candidate = createCandidate(base);
    if (!(await checkExists(candidate))) return candidate;
  }
};

const toSafeExt = (filename) => {
  const ext = filename.includes('.') ? filename.split('.').pop() : 'bin';
  return String(ext).toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
};

const tryDeriveStoragePathFromPublicUrl = (fileUrl) => {
  const { bucket } = getCfg();
  try {
    const url = new URL(fileUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
};

app.post('/auth/generate-username', async (req, res) => {
  const schema = z.object({ dogName: z.string().min(1) });
  try {
    const { dogName } = schema.parse(req.body);
    const username = await generateUniqueUsername(dogName);
    return res.json({ username });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error, 'Invalid request.') });
  }
});

app.post('/auth/signup', async (req, res) => {
  const schema = z.object({
    parentName: z.string().min(1),
    phoneNumber: z.string().min(1),
    dogName: z.string().min(1),
    breed: z.string().min(1),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of Birth must be in YYYY-MM-DD format.'),
    gender: z.enum(['male', 'female']),
    username: z.string().min(1),
    password: z.string().min(8),
  });

  let createdUserId = null;
  const sb = supabaseAdmin();
  try {
    const input = schema.parse(req.body);
    const passwordHash = await bcrypt.hash(input.password, 12);

    const { data: existing, error: existingError } = await sb.from('users').select('id').eq('username', input.username).maybeSingle();
    if (existingError && existingError.code !== 'PGRST116') throw existingError;
    if (existing) return res.status(409).json({ message: 'Username already exists. Please restart signup.' });

    const { data: userRow, error: userError } = await sb
      .from('users')
      .insert({
        role: 'parent',
        username: input.username,
        password_hash: passwordHash,
        parent_name: input.parentName,
        phone_number: input.phoneNumber,
      })
      .select('id, username, role')
      .single();
    if (userError) throw userError;
    createdUserId = userRow.id;

    const { error: petError } = await sb.from('pets').insert({
      parent_id: userRow.id,
      dog_name: input.dogName,
      breed: input.breed,
      dob: input.dob,
      gender: input.gender,
      profile_photo_url: null,
    });
    if (petError) throw petError;

    return res.status(201).json(buildSessionResponse(userRow));
  } catch (error) {
    if (createdUserId) await sb.from('users').delete().eq('id', createdUserId);
    return res.status(400).json({ message: getErrorMessage(error, 'Signup failed.') });
  }
});

app.post('/auth/login', async (req, res) => {
  const schema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
    role: z.enum(['parent', 'admin']),
  });
  const sb = supabaseAdmin();
  try {
    const input = schema.parse(req.body);
    const { data: userRow, error } = await sb
      .from('users')
      .select('id, username, role, password_hash')
      .eq('username', input.username)
      .eq('role', input.role)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!userRow) return res.status(401).json({ message: 'Invalid credentials.' });

    const ok = await bcrypt.compare(input.password, userRow.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials.' });

    return res.json(buildSessionResponse(userRow));
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error, 'Login failed.') });
  }
});

app.get('/parent/dashboard', requireAuth, requireRole('parent'), async (req, res) => {
  const sb = supabaseAdmin();
  try {
    const { data: pet, error: petError } = await sb
      .from('pets')
      .select('id, dog_name, breed, dob, gender, profile_photo_url')
      .eq('parent_id', req.auth.userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (petError && petError.code !== 'PGRST116') throw petError;
    if (!pet) return res.status(404).json({ message: 'No pet profile found for this account.' });

    const { data: records, error: recordsError } = await sb
      .from('medical_records')
      .select('id, file_url, file_name, file_type, description, created_at')
      .eq('pet_id', pet.id)
      .order('created_at', { ascending: false });
    if (recordsError) throw recordsError;

    return res.json({
      pet: {
        id: pet.id,
        dogName: pet.dog_name,
        breed: pet.breed,
        dob: pet.dob,
        gender: pet.gender,
        profilePhotoUrl: pet.profile_photo_url,
      },
      medicalRecords: (records || []).map((r) => ({
        id: r.id,
        fileUrl: r.file_url,
        fileName: r.file_name,
        fileType: r.file_type,
        description: r.description ?? null,
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error, 'Failed to load dashboard.') });
  }
});

app.post('/parent/profile-photo', requireAuth, requireRole('parent'), upload.single('photo'), async (req, res) => {
  const sb = supabaseAdmin();
  const { bucket } = getCfg();
  try {
    const petId = String(req.body.petId || '');
    if (!petId) return res.status(400).json({ message: 'petId is required.' });
    if (!req.file) return res.status(400).json({ message: 'Profile photo is required.' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ message: 'Only image files are allowed.' });

    const { data: pet, error: petError } = await sb.from('pets').select('id').eq('id', petId).eq('parent_id', req.auth.userId).maybeSingle();
    if (petError && petError.code !== 'PGRST116') throw petError;
    if (!pet) return res.status(404).json({ message: 'Pet not found.' });

    const ext = toSafeExt(req.file.originalname);
    const storagePath = `profile-photos/${petId}.${ext}`;
    const { error: uploadError } = await sb.storage.from(bucket).upload(storagePath, req.file.buffer, {
      upsert: true,
      contentType: req.file.mimetype,
    });
    if (uploadError) throw uploadError;
    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(storagePath);
    const profilePhotoUrl = urlData.publicUrl;

    const { error: updateError } = await sb.from('pets').update({ profile_photo_url: profilePhotoUrl }).eq('id', petId);
    if (updateError) throw updateError;

    return res.json({ profilePhotoUrl });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error, 'Profile photo upload failed.') });
  }
});

app.get('/admin/pets', requireAuth, requireRole('admin'), async (req, res) => {
  const sb = supabaseAdmin();
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const sortBy = String(req.query.sortBy || 'created_at');
    const sortDir = String(req.query.sortDir || 'desc') === 'asc' ? 'asc' : 'desc';

    const { data, error } = await sb.from('pets').select('id, dog_name, breed, profile_photo_url, created_at, users!pets_parent_id_fkey(parent_name, phone_number)');
    if (error) throw error;

    const mapped = (data || []).map((row) => ({
      id: row.id,
      dogName: row.dog_name,
      breed: row.breed,
      profilePhotoUrl: row.profile_photo_url,
      dateRegistered: row.created_at,
      parentName: row.users?.parent_name || '',
      parentPhone: row.users?.phone_number || '',
    }));

    const filtered = search
      ? mapped.filter((row) => [row.dogName, row.breed, row.parentName, row.parentPhone].some((v) => v.toLowerCase().includes(search)))
      : mapped;

    const sortable = [...filtered].sort((a, b) => {
      const aValue = sortBy === 'dog_name' ? a.dogName : sortBy === 'breed' ? a.breed : a.dateRegistered;
      const bValue = sortBy === 'dog_name' ? b.dogName : sortBy === 'breed' ? b.breed : b.dateRegistered;
      const cmp = String(aValue).localeCompare(String(bValue));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return res.json({ pets: sortable });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error, 'Failed to load pets.') });
  }
});

app.get('/admin/pets/:petId', requireAuth, requireRole('admin'), async (req, res) => {
  const sb = supabaseAdmin();
  try {
    const { petId } = req.params;
    const { data: pet, error: petError } = await sb
      .from('pets')
      .select('id, dog_name, breed, dob, gender, profile_photo_url, users!pets_parent_id_fkey(parent_name, phone_number)')
      .eq('id', petId)
      .maybeSingle();
    if (petError && petError.code !== 'PGRST116') throw petError;
    if (!pet) return res.status(404).json({ message: 'Pet not found.' });

    const { data: records, error: recordsError } = await sb
      .from('medical_records')
      .select('id, file_url, file_name, file_type, description, created_at')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });
    if (recordsError) throw recordsError;

    return res.json({
      pet: {
        id: pet.id,
        dogName: pet.dog_name,
        breed: pet.breed,
        dob: pet.dob,
        gender: pet.gender,
        profilePhotoUrl: pet.profile_photo_url,
        parentName: pet.users?.parent_name || '',
        parentPhone: pet.users?.phone_number || '',
      },
      medicalRecords: (records || []).map((r) => ({
        id: r.id,
        fileUrl: r.file_url,
        fileName: r.file_name,
        fileType: r.file_type,
        description: r.description ?? null,
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error, 'Failed to load pet details.') });
  }
});

app.post('/admin/pets/:petId/records', requireAuth, requireRole('admin'), upload.single('file'), async (req, res) => {
  const sb = supabaseAdmin();
  const { bucket } = getCfg();
  const schema = z.object({
    fileType: z.enum(['prescription', 'lab_report', 'media']),
    description: z.string().max(2000).optional().default(''),
  });

  try {
    const { petId } = req.params;
    const { fileType, description } = schema.parse(req.body);
    if (!req.file) return res.status(400).json({ message: 'File is required.' });
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(req.file.mimetype)) return res.status(400).json({ message: 'Only PDF, JPG, PNG, and WEBP are allowed.' });

    const ext = toSafeExt(req.file.originalname);
    const timestamp = Date.now();
    const safeName = req.file.originalname.replace(/[^\w.-]/g, '_');
    const storagePath = `medical-records/${petId}/${timestamp}_${safeName}.${ext}`;

    const { error: uploadError } = await sb.storage.from(bucket).upload(storagePath, req.file.buffer, { upsert: false, contentType: req.file.mimetype });
    if (uploadError) throw uploadError;
    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(storagePath);
    const fileUrl = urlData.publicUrl;

    const { data: inserted, error: insertError } = await sb
      .from('medical_records')
      .insert({
        pet_id: petId,
        file_url: fileUrl,
        storage_path: storagePath,
        file_name: req.file.originalname,
        file_type: fileType,
        description: description.trim() || null,
        uploaded_by: req.auth.userId,
      })
      .select('id, file_url, file_name, file_type, description, created_at')
      .single();
    if (insertError) throw insertError;

    return res.status(201).json({
      record: {
        id: inserted.id,
        fileUrl: inserted.file_url,
        fileName: inserted.file_name,
        fileType: inserted.file_type,
        description: inserted.description ?? null,
        createdAt: inserted.created_at,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error, 'File upload failed.') });
  }
});

app.delete('/admin/pets/:petId/records/:recordId', requireAuth, requireRole('admin'), async (req, res) => {
  const sb = supabaseAdmin();
  const { bucket } = getCfg();
  try {
    const { petId, recordId } = req.params;
    const { data: record, error } = await sb.from('medical_records').select('id, pet_id, file_url, storage_path').eq('id', recordId).eq('pet_id', petId).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (!record) return res.status(404).json({ message: 'Record not found.' });

    const storagePath = record.storage_path || tryDeriveStoragePathFromPublicUrl(record.file_url);
    if (storagePath) {
      const { error: removeError } = await sb.storage.from(bucket).remove([storagePath]);
      if (removeError) throw removeError;
    }

    const { error: deleteError } = await sb.from('medical_records').delete().eq('id', recordId);
    if (deleteError) throw deleteError;

    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ message: getErrorMessage(error, 'Delete failed.') });
  }
});

exports.digitalFileApi = functions.region('asia-south1').https.onRequest(app);
