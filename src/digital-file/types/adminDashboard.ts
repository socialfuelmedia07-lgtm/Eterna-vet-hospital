import type { MedicalRecord, MedicalFileType } from './parentDashboard';

export interface AdminPetRow {
  id: string;
  dogName: string;
  breed: string;
  profilePhotoUrl: string | null;
  parentName: string;
  parentPhone: string;
  dateRegistered: string;
}

export interface AdminPetDetails {
  id: string;
  dogName: string;
  breed: string;
  dob: string;
  gender: 'male' | 'female';
  profilePhotoUrl: string | null;
  parentName: string;
  parentPhone: string;
}

export interface AdminPetPanelData {
  pet: AdminPetDetails;
  medicalRecords: MedicalRecord[];
}

export interface UploadedRecordResult {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: MedicalFileType;
  createdAt: string;
}
