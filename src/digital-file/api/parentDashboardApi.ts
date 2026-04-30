import type { ParentDashboardData } from '../types/parentDashboard';

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

export const getParentDashboardData = async (token: string): Promise<ParentDashboardData> => {
  const response = await fetch(`${DIGITAL_FILE_API_BASE}/parent/dashboard`, {
    method: 'GET',
    headers: authHeaders(token),
  });

  return parseJsonOrThrow<ParentDashboardData>(response);
};

export const uploadParentProfilePhoto = async (token: string, petId: string, photoFile: File): Promise<{ profilePhotoUrl: string }> => {
  const formData = new FormData();
  formData.append('petId', petId);
  formData.append('photo', photoFile);

  const response = await fetch(`${DIGITAL_FILE_API_BASE}/parent/profile-photo`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });

  return parseJsonOrThrow<{ profilePhotoUrl: string }>(response);
};
