export type MedicalFileType = 'prescription' | 'lab_report' | 'media';

export interface PetProfile {
  id: string;
  dogName: string;
  breed: string;
  dob: string;
  gender: 'male' | 'female';
  profilePhotoUrl: string | null;
}

export interface MedicalRecord {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: MedicalFileType;
  createdAt: string;
}

export interface ParentDashboardData {
  pet: PetProfile;
  medicalRecords: MedicalRecord[];
}
