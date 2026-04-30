import type { UploadedRecordResult } from '../types/adminDashboard';
import type { AdminPetPanelData, AdminPetRow } from '../types/adminDashboard';
import type { MedicalFileType } from '../types/parentDashboard';

const DIGITAL_FILE_API_BASE = '/digital-file/api';

const authHeaders = (token: string): HeadersInit => ({
  Authorization: `Bearer ${token}`,
});

const parseJsonOrThrow = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    try {
      const data = (await response.json()) as { message?: string };
      throw new Error(data.message || 'Request failed. Please try again.');
    } catch {
      throw new Error('Request failed. Please try again.');
    }
  }
  return (await response.json()) as T;
};

export const getAdminPets = async (token: string, search: string, sortBy: string, sortDir: 'asc' | 'desc'): Promise<AdminPetRow[]> => {
  const params = new URLSearchParams({
    search,
    sortBy,
    sortDir,
  });
  const response = await fetch(`${DIGITAL_FILE_API_BASE}/admin/pets?${params.toString()}`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  const data = await parseJsonOrThrow<{ pets: AdminPetRow[] }>(response);
  return data.pets;
};

export const getAdminPetDetails = async (token: string, petId: string): Promise<AdminPetPanelData> => {
  const response = await fetch(`${DIGITAL_FILE_API_BASE}/admin/pets/${petId}`, {
    method: 'GET',
    headers: authHeaders(token),
  });
  return parseJsonOrThrow<AdminPetPanelData>(response);
};

export const uploadMedicalRecord = async (
  token: string,
  petId: string,
  fileType: MedicalFileType,
  file: File,
  description: string,
): Promise<UploadedRecordResult> => {
  const form = new FormData();
  form.append('fileType', fileType);
  form.append('description', description);
  form.append('file', file);

  const response = await fetch(`${DIGITAL_FILE_API_BASE}/admin/pets/${petId}/records`, {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  });

  const data = await parseJsonOrThrow<{ record: UploadedRecordResult }>(response);
  return data.record;
};

export const deleteMedicalRecord = async (token: string, petId: string, recordId: string): Promise<void> => {
  const response = await fetch(`${DIGITAL_FILE_API_BASE}/admin/pets/${petId}/records/${recordId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  await parseJsonOrThrow<{ ok: true }>(response);
};
