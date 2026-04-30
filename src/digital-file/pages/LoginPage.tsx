import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../types/auth';
import './digitalFileAuth.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [role, setRole] = useState<UserRole>('parent');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await login({
        role,
        username: username.trim(),
        password,
      });
      setSession(session);
      navigate(role === 'admin' ? '/digital-file/admin-dashboard' : '/digital-file/parent-dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="digital-file-auth-page">
      <div className="digital-file-auth-card">
        <h1 className="digital-file-auth-title">Digital Pet File Login</h1>
        <p className="digital-file-auth-subtitle">Choose your role and sign in to continue.</p>

        <div className="digital-file-role-toggle">
          <button
            type="button"
            className={`digital-file-role-button ${role === 'parent' ? 'active' : ''}`}
            onClick={() => setRole('parent')}
          >
            I&apos;m a Pet Parent
          </button>
          <button
            type="button"
            className={`digital-file-role-button ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            I&apos;m an Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="digital-file-form-grid">
            <div className="digital-file-field full">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="digital-file-field full">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          {errorMessage ? <p className="digital-file-error">{errorMessage}</p> : null}

          <div className="digital-file-auth-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </form>

        {role === 'parent' ? (
          <p className="digital-file-link-row">
            New pet parent? <Link to="/digital-file/signup">Create your account</Link>
          </p>
        ) : (
          <p className="digital-file-link-row">Admins are pre-created and can log in directly.</p>
        )}
      </div>
    </section>
  );
};

export default LoginPage;
