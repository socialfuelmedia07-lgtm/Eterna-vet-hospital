import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParentDashboardData, uploadParentProfilePhoto } from '../api/parentDashboardApi';
import { useAuth } from '../auth/AuthContext';
import type { MedicalRecord, ParentDashboardData } from '../types/parentDashboard';
import './parentDashboard.css';

const ParentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, clearSession } = useAuth();
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const records = useMemo<MedicalRecord[]>(() => {
    if (!data?.medicalRecords) return [];
    return [...data.medicalRecords].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [data?.medicalRecords]);

  const prescriptionRecords = useMemo(() => records.filter((r) => r.fileType === 'prescription'), [records]);
  const otherRecords = useMemo(() => records.filter((r) => r.fileType !== 'prescription'), [records]);

  useEffect(() => {
    const loadDashboard = async (): Promise<void> => {
      if (!token) {
        setErrorMessage('No active session found. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        setErrorMessage('');
        const dashboardData = await getParentDashboardData(token);
        setData(dashboardData);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load parent dashboard.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [token]);

  const handleLogout = (): void => {
    clearSession();
    navigate('/digital-file/login', { replace: true });
  };

  const handlePhotoInputChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      return;
    }

    if (!token || !data?.pet.id) {
      setErrorMessage('Missing session or pet profile data.');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setErrorMessage('');
      setStatusMessage('');
      const result = await uploadParentProfilePhoto(token, data.pet.id, file);
      setData((previous) =>
        previous
          ? {
              ...previous,
              pet: {
                ...previous.pet,
                profilePhotoUrl: result.profilePhotoUrl,
              },
            }
          : previous,
      );
      setStatusMessage('Profile photo updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Photo upload failed.';
      setErrorMessage(message);
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const downloadMedicalRecord = async (record: MedicalRecord): Promise<void> => {
    try {
      setErrorMessage('');
      const response = await fetch(record.fileUrl, { method: 'GET' });
      if (!response.ok) throw new Error('Failed to fetch file for download.');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = record.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not download file.';
      setErrorMessage(message);
    }
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

  if (isLoading) {
    return (
      <section className="parent-dashboard-page">
        <div className="parent-dashboard-card">
          <p>Loading dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="parent-dashboard-page">
      <div className="parent-dashboard-card">
        <div className="parent-dashboard-header">
          <div>
            <h1>Parent Dashboard</h1>
            <p className="parent-dashboard-subtitle">Welcome, {user?.username ?? 'Pet Parent'}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {errorMessage ? <p className="digital-file-error parent-status">{errorMessage}</p> : null}
        {statusMessage ? <p className="parent-status">{statusMessage}</p> : null}

        {data?.pet ? (
          <article className="parent-pet-profile">
            <div className="parent-photo-box">
              {data.pet.profilePhotoUrl ? (
                <img className="parent-photo-preview" src={data.pet.profilePhotoUrl} alt={`${data.pet.dogName} profile`} />
              ) : (
                <div className="parent-photo-placeholder">No profile photo yet</div>
              )}

              <div className="digital-file-auth-actions">
                <label className="btn btn-primary" htmlFor="pet-photo-upload">
                  {data.pet.profilePhotoUrl ? 'Replace Photo' : 'Upload Profile Photo'}
                </label>
                <input
                  id="pet-photo-upload"
                  type="file"
                  accept="image/*"
                  disabled={isUploadingPhoto}
                  style={{ display: 'none' }}
                  onChange={(event) => {
                    void handlePhotoInputChange(event);
                  }}
                />
              </div>
            </div>

            <div className="parent-pet-details">
              <div className="parent-detail-item">
                <p className="parent-detail-label">Dog Name</p>
                <p>{data.pet.dogName}</p>
              </div>
              <div className="parent-detail-item">
                <p className="parent-detail-label">Breed</p>
                <p>{data.pet.breed}</p>
              </div>
              <div className="parent-detail-item">
                <p className="parent-detail-label">Date of Birth</p>
                <p>{formatDate(data.pet.dob)}</p>
              </div>
              <div className="parent-detail-item">
                <p className="parent-detail-label">Gender</p>
                <p>{data.pet.gender}</p>
              </div>
            </div>
          </article>
        ) : null}

        <h2 className="parent-records-title">Medical records</h2>
        {records.length === 0 ? (
          <p className="parent-empty">Your vet hasn&apos;t uploaded any records yet.</p>
        ) : (
          <div className="parent-record-list">
            {prescriptionRecords.length > 0 ? (
              <>
                <h3 className="parent-record-section-heading">Prescriptions &amp; medication (PDF)</h3>
                {prescriptionRecords.map((record) => (
                  <article key={record.id} className="parent-record-item parent-record-item--rx">
                    <div className="parent-record-meta">
                      <p>{record.fileName}</p>
                      <p className="parent-record-subtext">Uploaded {formatDate(record.createdAt)}</p>
                      {record.description ? <p className="parent-record-subtext">{record.description}</p> : null}
                    </div>

                    <div className="parent-record-actions">
                      <span className="parent-type-badge parent-type-badge--rx">Prescription</span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          void downloadMedicalRecord(record);
                        }}
                      >
                        Download PDF
                      </button>
                    </div>
                  </article>
                ))}
              </>
            ) : null}

            {otherRecords.length > 0 ? (
              <>
                <h3 className="parent-record-section-heading">Labs, imaging &amp; other files</h3>
                {otherRecords.map((record) => (
                  <article key={record.id} className="parent-record-item">
                    <div className="parent-record-meta">
                      <p>{record.fileName}</p>
                      <p className="parent-record-subtext">Uploaded {formatDate(record.createdAt)}</p>
                      {record.description ? <p className="parent-record-subtext">{record.description}</p> : null}
                    </div>

                    <div className="parent-record-actions">
                      <span className="parent-type-badge">{record.fileType.replace('_', ' ')}</span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          void downloadMedicalRecord(record);
                        }}
                      >
                        Download
                      </button>
                    </div>
                  </article>
                ))}
              </>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
};

export default ParentDashboardPage;
