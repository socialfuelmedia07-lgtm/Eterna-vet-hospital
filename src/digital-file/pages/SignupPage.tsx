import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSignupUsername, signupParent } from '../api/authApi';
import { useAuth } from '../auth/AuthContext';
import './digitalFileAuth.css';

type SignupStep = 'details' | 'username' | 'password';
type PetGender = 'male' | 'female';

interface ParentSignupFormState {
  parentName: string;
  phoneNumber: string;
  dogName: string;
  breed: string;
  dob: string;
  gender: PetGender;
}

const initialState: ParentSignupFormState = {
  parentName: '',
  phoneNumber: '',
  dogName: '',
  breed: '',
  dob: '',
  gender: 'male',
};

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [step, setStep] = useState<SignupStep>('details');
  const [form, setForm] = useState<ParentSignupFormState>(initialState);
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDetailsValid = useMemo(() => {
    return (
      form.parentName.trim() &&
      form.phoneNumber.trim() &&
      form.dogName.trim() &&
      form.breed.trim() &&
      form.dob &&
      form.gender
    );
  }, [form]);

  const updateField = <K extends keyof ParentSignupFormState>(key: K, value: ParentSignupFormState[K]): void => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleDetailsSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage('');
    if (!isDetailsValid) {
      setErrorMessage('Please complete all fields in this step.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { username } = await generateSignupUsername({ dogName: form.dogName });
      setGeneratedUsername(username);
      setStep('username');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate username.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await signupParent({
        parentName: form.parentName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        dogName: form.dogName.trim(),
        breed: form.breed.trim(),
        dob: form.dob,
        gender: form.gender,
        username: generatedUsername,
        password,
      });
      setSession(session);
      navigate('/digital-file/parent-dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="digital-file-auth-page">
      <div className="digital-file-auth-card">
        <h1 className="digital-file-auth-title">Pet Parent Signup</h1>
        <p className="digital-file-auth-subtitle">Complete all 3 steps to create your digital pet file account.</p>

        {step === 'details' ? (
          <form onSubmit={handleDetailsSubmit}>
            <div className="digital-file-form-grid">
              <div className="digital-file-field">
                <label htmlFor="parent-name">Parent Name</label>
                <input id="parent-name" value={form.parentName} onChange={(event) => updateField('parentName', event.target.value)} />
              </div>
              <div className="digital-file-field">
                <label htmlFor="phone-number">Phone Number</label>
                <input
                  id="phone-number"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(event) => updateField('phoneNumber', event.target.value)}
                />
              </div>
              <div className="digital-file-field">
                <label htmlFor="dog-name">Dog Name</label>
                <input id="dog-name" value={form.dogName} onChange={(event) => updateField('dogName', event.target.value)} />
              </div>
              <div className="digital-file-field">
                <label htmlFor="breed">Breed</label>
                <input id="breed" value={form.breed} onChange={(event) => updateField('breed', event.target.value)} />
              </div>
              <div className="digital-file-field">
                <label htmlFor="dob">Date of Birth</label>
                <input id="dob" type="date" value={form.dob} onChange={(event) => updateField('dob', event.target.value)} />
              </div>
              <div className="digital-file-field">
                <label htmlFor="gender">Gender</label>
                <select id="gender" value={form.gender} onChange={(event) => updateField('gender', event.target.value as PetGender)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {errorMessage ? <p className="digital-file-error">{errorMessage}</p> : null}

            <div className="digital-file-auth-actions">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Generating username...' : 'Continue'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/digital-file/login')}>
                Back to Login
              </button>
            </div>
          </form>
        ) : null}

        {step === 'username' ? (
          <>
            <div className="digital-file-success-box">
              <p>Your generated username is:</p>
              <p>
                <strong>{generatedUsername}</strong>
              </p>
              <p>You cannot edit this username.</p>
            </div>

            <div className="digital-file-auth-actions">
              <button type="button" className="btn btn-primary" onClick={() => setStep('password')}>
                Set Password
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setStep('details')}>
                Edit Previous Details
              </button>
            </div>
          </>
        ) : null}

        {step === 'password' ? (
          <form onSubmit={handleCreateAccount}>
            <div className="digital-file-form-grid">
              <div className="digital-file-field full">
                <label htmlFor="generated-username">Username</label>
                <input id="generated-username" value={generatedUsername} readOnly />
              </div>
              <div className="digital-file-field full">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="digital-file-field full">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            </div>

            {errorMessage ? <p className="digital-file-error">{errorMessage}</p> : null}

            <div className="digital-file-auth-actions">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setStep('username')}>
                Back
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </section>
  );
};

export default SignupPage;
