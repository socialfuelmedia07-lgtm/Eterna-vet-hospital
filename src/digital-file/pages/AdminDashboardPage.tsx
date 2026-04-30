import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminPetDetails, getAdminPets, uploadMedicalRecord } from '../api/adminDashboardApi';
import { useAuth } from '../auth/AuthContext';
import type { AdminPetPanelData, AdminPetRow } from '../types/adminDashboard';
import type { MedicalFileType } from '../types/parentDashboard';
import './adminDashboard.css';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, clearSession } = useAuth();
  const [pets, setPets] = useState<AdminPetRow[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'dog_name' | 'breed'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [panelData, setPanelData] = useState<AdminPetPanelData | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<MedicalFileType>('prescription');
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPets = async (): Promise<void> => {
      if (!token) return;
      try {
        setErrorMessage('');
        const rows = await getAdminPets(token, search, sortBy, sortDir);
        setPets(rows);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load pets.');
      } finally {
        setIsLoading(false);
      }
    };
    void loadPets();
  }, [token, search, sortBy, sortDir]);

  const selectedPet = useMemo(() => pets.find((pet) => pet.id === selectedPetId) || null, [pets, selectedPetId]);

  const handleLogout = (): void => {
    clearSession();
    navigate('/digital-file/login', { replace: true });
  };

  const openPetPanel = async (petId: string): Promise<void> => {
    if (!token) return;
    setSelectedPetId(petId);
    try {
      const details = await getAdminPetDetails(token, petId);
      setPanelData(details);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load pet details.');
    }
  };

  const handleUploadMedicalFile = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file || !selectedPetId || !token) return;

    try {
      setUploading(true);
      setErrorMessage('');
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticRecord = {
        id: optimisticId,
        fileName: file.name,
        fileType: selectedFileType,
        fileUrl: '',
        createdAt: new Date().toISOString(),
      };
      setPanelData((prev) =>
        prev
          ? {
              ...prev,
              medicalRecords: [optimisticRecord, ...prev.medicalRecords],
            }
          : prev,
      );

      const uploaded = await uploadMedicalRecord(token, selectedPetId, selectedFileType, file);
      setPanelData((prev) =>
        prev
          ? {
              ...prev,
              medicalRecords: prev.medicalRecords.map((record) => (record.id === optimisticId ? uploaded : record)),
            }
          : prev,
      );
    } catch (error) {
      setPanelData((prev) =>
        prev
          ? {
              ...prev,
              medicalRecords: prev.medicalRecords.filter((record) => !record.id.startsWith('optimistic-')),
            }
          : prev,
      );
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-card">
        <div className="admin-dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Logged in as: {user?.username ?? 'Admin'}</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {errorMessage ? <p className="digital-file-error">{errorMessage}</p> : null}

        <div className="admin-controls">
          <input
            type="text"
            placeholder="Search by dog, breed, parent name or phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'created_at' | 'dog_name' | 'breed')}>
            <option value="created_at">Date Registered</option>
            <option value="dog_name">Dog Name</option>
            <option value="breed">Breed</option>
          </select>
          <select value={sortDir} onChange={(event) => setSortDir(event.target.value as 'asc' | 'desc')}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Profile Photo</th>
                <th>Dog Name</th>
                <th>Breed</th>
                <th>Parent Name</th>
                <th>Parent Phone</th>
                <th>Date Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7}>Loading pets...</td>
                </tr>
              ) : pets.length === 0 ? (
                <tr>
                  <td colSpan={7}>No pets found.</td>
                </tr>
              ) : (
                pets.map((pet) => (
                  <tr key={pet.id} onClick={() => void openPetPanel(pet.id)}>
                    <td>
                      {pet.profilePhotoUrl ? (
                        <img className="admin-thumb" src={pet.profilePhotoUrl} alt={`${pet.dogName} thumbnail`} />
                      ) : (
                        <div className="admin-thumb" />
                      )}
                    </td>
                    <td>{pet.dogName}</td>
                    <td>{pet.breed}</td>
                    <td>{pet.parentName}</td>
                    <td>{pet.parentPhone}</td>
                    <td>{formatDate(pet.dateRegistered)}</td>
                    <td>
                      <button type="button" className="admin-open-btn" onClick={() => void openPetPanel(pet.id)}>
                        Open File
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPetId && selectedPet && panelData ? (
        <div className="admin-panel-backdrop" onClick={() => setSelectedPetId(null)}>
          <aside className="admin-panel" onClick={(event) => event.stopPropagation()}>
            <div className="admin-panel-head">
              <h2>{panelData.pet.dogName}</h2>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedPetId(null)}>
                Close
              </button>
            </div>

            {panelData.pet.profilePhotoUrl ? (
              <img className="parent-photo-preview" src={panelData.pet.profilePhotoUrl} alt={`${panelData.pet.dogName} profile`} />
            ) : (
              <div className="parent-photo-placeholder">No profile photo</div>
            )}

            <div className="admin-detail-grid">
              <div className="admin-detail-card">Breed: {panelData.pet.breed}</div>
              <div className="admin-detail-card">Gender: {panelData.pet.gender}</div>
              <div className="admin-detail-card">DOB: {formatDate(panelData.pet.dob)}</div>
              <div className="admin-detail-card">Parent: {panelData.pet.parentName}</div>
              <div className="admin-detail-card">Phone: {panelData.pet.parentPhone}</div>
            </div>

            <div className="admin-upload-block">
              <h3>Upload Files</h3>
              <div className="admin-upload-row">
                <select value={selectedFileType} onChange={(event) => setSelectedFileType(event.target.value as MedicalFileType)}>
                  <option value="prescription">Prescription</option>
                  <option value="lab_report">Lab Report</option>
                  <option value="media">Media</option>
                </select>
                <label htmlFor="admin-upload-input" className="btn btn-primary">
                  {uploading ? 'Uploading...' : 'Upload File'}
                </label>
                <input
                  id="admin-upload-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  disabled={uploading}
                  style={{ display: 'none' }}
                  onChange={(event) => {
                    void handleUploadMedicalFile(event);
                  }}
                />
              </div>
            </div>

            <h3>Medical Records</h3>
            <div className="admin-record-list">
              {panelData.medicalRecords.length === 0 ? (
                <p className="parent-empty">No records uploaded yet.</p>
              ) : (
                panelData.medicalRecords.map((record) => (
                  <article key={record.id} className="admin-record-item">
                    <div>
                      <p>{record.fileName}</p>
                      <p className="parent-record-subtext">
                        {record.fileType.replace('_', ' ')} - {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
};

export default AdminDashboardPage;
