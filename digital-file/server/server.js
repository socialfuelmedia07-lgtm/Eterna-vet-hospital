import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { config } from './config.js';
import { requireAuth, requireRole } from './middleware.js';
import { supabaseAdmin } from './supabaseClient.js';
import { createCandidate, normalizeDogNameToUsernameBase, signSessionToken, toSafeExt } from './utils.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const api = express.Router();
app.use('/digital-file/api', api);

const buildSessionResponse = (userRow) => ({
  token: signSessionToken(userRow),
  user: {
    id: userRow.id,
    username: userRow.username,
    role: userRow.role,
  },
});

const generateUniqueUsername = async (dogName) => {
  const base = normalizeDogNameToUsernameBase(dogName);
  const checkExists = async (username) => {
    const { data, error } = await supabaseAdmin.from('users').select('id').eq('username', username).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return Boolean(data);
  };

  if (!(await checkExists(base))) return base;
  for (;;) {
    const candidate = createCandidate(base);
    if (!(await checkExists(candidate))) return candidate;
  }
};

api.post('/auth/generate-username', async (req, res) => {
  const schema = z.object({ dogName: z.string().min(1) });
  try {
    const { dogName } = schema.parse(req.body);
    const username = await generateUniqueUsername(dogName);
    return res.json({ username });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid request.' });
  }
});

api.post('/auth/signup', async (req, res) => {
  const schema = z.object({
    parentName: z.string().min(1),
    phoneNumber: z.string().min(1),
    dogName: z.string().min(1),
    breed: z.string().min(1),
    dob: z.string().min(1),
    gender: z.enum(['male', 'female']),
    username: z.string().min(1),
    password: z.string().min(8),
  });

  let createdUserId = null;
  try {
    const input = schema.parse(req.body);
    const passwordHash = await bcrypt.hash(input.password, 12);

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', input.username)
      .maybeSingle();
    if (existingError && existingError.code !== 'PGRST116') throw existingError;
    if (existing) {
      return res.status(409).json({ message: 'Username already exists. Please restart signup.' });
    }

    const { data: userRow, error: userError } = await supabaseAdmin
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

    const { error: petError } = await supabaseAdmin.from('pets').insert({
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
    if (createdUserId) {
      await supabaseAdmin.from('users').delete().eq('id', createdUserId);
    }
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Signup failed.' });
  }
});

api.post('/auth/login', async (req, res) => {
  const schema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
    role: z.enum(['parent', 'admin']),
  });
  try {
    const input = schema.parse(req.body);
    const { data: userRow, error } = await supabaseAdmin
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
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Login failed.' });
  }
});

api.get('/parent/dashboard', requireAuth, requireRole('parent'), async (req, res) => {
  try {
    const { data: pet, error: petError } = await supabaseAdmin
      .from('pets')
      .select('id, dog_name, breed, dob, gender, profile_photo_url')
      .eq('parent_id', req.auth.userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (petError && petError.code !== 'PGRST116') throw petError;
    if (!pet) return res.status(404).json({ message: 'No pet profile found for this account.' });

    const { data: records, error: recordsError } = await supabaseAdmin
      .from('medical_records')
      .select('id, file_url, file_name, file_type, created_at')
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
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to load dashboard.' });
  }
});

api.post('/parent/profile-photo', requireAuth, requireRole('parent'), upload.single('photo'), async (req, res) => {
  try {
    const petId = String(req.body.petId || '');
    if (!petId) return res.status(400).json({ message: 'petId is required.' });
    if (!req.file) return res.status(400).json({ message: 'Profile photo is required.' });
    if (!req.file.mimetype.startsWith('image/')) return res.status(400).json({ message: 'Only image files are allowed.' });

    const { data: pet, error: petError } = await supabaseAdmin
      .from('pets')
      .select('id')
      .eq('id', petId)
      .eq('parent_id', req.auth.userId)
      .maybeSingle();
    if (petError && petError.code !== 'PGRST116') throw petError;
    if (!pet) return res.status(404).json({ message: 'Pet not found.' });

    const ext = toSafeExt(req.file.originalname);
    const storagePath = `profile-photos/${petId}.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(config.storageBucket)
      .upload(storagePath, req.file.buffer, { upsert: true, contentType: req.file.mimetype });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage.from(config.storageBucket).getPublicUrl(storagePath);
    const profilePhotoUrl = urlData.publicUrl;

    const { error: updateError } = await supabaseAdmin.from('pets').update({ profile_photo_url: profilePhotoUrl }).eq('id', petId);
    if (updateError) throw updateError;

    return res.json({ profilePhotoUrl });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Profile photo upload failed.' });
  }
});

api.get('/admin/pets', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const sortBy = String(req.query.sortBy || 'created_at');
    const sortDir = String(req.query.sortDir || 'desc') === 'asc' ? 'asc' : 'desc';

    const { data, error } = await supabaseAdmin
      .from('pets')
      .select(
        'id, dog_name, breed, profile_photo_url, created_at, users!pets_parent_id_fkey(parent_name, phone_number)',
      );
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
      ? mapped.filter((row) =>
          [row.dogName, row.breed, row.parentName, row.parentPhone].some((value) =>
            value.toLowerCase().includes(search),
          ),
        )
      : mapped;

    const sortable = [...filtered].sort((a, b) => {
      const aValue = sortBy === 'dog_name' ? a.dogName : sortBy === 'breed' ? a.breed : a.dateRegistered;
      const bValue = sortBy === 'dog_name' ? b.dogName : sortBy === 'breed' ? b.breed : b.dateRegistered;
      const cmp = String(aValue).localeCompare(String(bValue));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return res.json({ pets: sortable });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to load pets.' });
  }
});

api.get('/admin/pets/:petId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { petId } = req.params;
    const { data: pet, error: petError } = await supabaseAdmin
      .from('pets')
      .select('id, dog_name, breed, dob, gender, profile_photo_url, users!pets_parent_id_fkey(parent_name, phone_number)')
      .eq('id', petId)
      .maybeSingle();
    if (petError && petError.code !== 'PGRST116') throw petError;
    if (!pet) return res.status(404).json({ message: 'Pet not found.' });

    const { data: records, error: recordsError } = await supabaseAdmin
      .from('medical_records')
      .select('id, file_url, file_name, file_type, created_at')
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
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to load pet details.' });
  }
});

api.post('/admin/pets/:petId/records', requireAuth, requireRole('admin'), upload.single('file'), async (req, res) => {
  const schema = z.object({ fileType: z.enum(['prescription', 'lab_report', 'media']) });
  try {
    const { petId } = req.params;
    const { fileType } = schema.parse(req.body);
    if (!req.file) return res.status(400).json({ message: 'File is required.' });

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only PDF, JPG, PNG, and WEBP are allowed.' });
    }

    const ext = toSafeExt(req.file.originalname);
    const timestamp = Date.now();
    const safeName = req.file.originalname.replace(/[^\w.-]/g, '_');
    const storagePath = `medical-records/${petId}/${timestamp}_${safeName}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(config.storageBucket)
      .upload(storagePath, req.file.buffer, { upsert: false, contentType: req.file.mimetype });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabaseAdmin.storage.from(config.storageBucket).getPublicUrl(storagePath);
    const fileUrl = urlData.publicUrl;

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('medical_records')
      .insert({
        pet_id: petId,
        file_url: fileUrl,
        file_name: req.file.originalname,
        file_type: fileType,
        uploaded_by: req.auth.userId,
      })
      .select('id, file_url, file_name, file_type, created_at')
      .single();
    if (insertError) throw insertError;

    return res.status(201).json({
      record: {
        id: inserted.id,
        fileUrl: inserted.file_url,
        fileName: inserted.file_name,
        fileType: inserted.file_type,
        createdAt: inserted.created_at,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error instanceof Error ? error.message : 'File upload failed.' });
  }
});

app.listen(config.port, () => {
  console.log(`Digital File API running on http://localhost:${config.port}`);
});
