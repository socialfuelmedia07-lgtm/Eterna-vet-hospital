import type { AuthSession, UserRole } from '../types/auth';

interface ApiErrorResponse {
  message?: string;
}

interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

interface SignupRequest {
  parentName: string;
  phoneNumber: string;
  dogName: string;
  breed: string;
  dob: string;
  gender: 'male' | 'female';
  username: string;
  password: string;
}

interface UsernameRequest {
  dogName: string;
}

const DIGITAL_FILE_API_BASE = '/digital-file/api';

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      return text ? `Request failed: ${text.slice(0, 120)}` : 'Request failed. Please try again.';
    }
    const data = (await response.json()) as ApiErrorResponse;
    return data.message || 'Request failed. Please try again.';
  } catch {
    return 'Request failed. Please try again.';
  }
};

const doJsonRequest = async <TResponse>(path: string, method: 'POST', body: unknown): Promise<TResponse> => {
  const response = await fetch(`${DIGITAL_FILE_API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as TResponse;
};

export const login = async (request: LoginRequest): Promise<AuthSession> => {
  return doJsonRequest<AuthSession>('/auth/login', 'POST', request);
};

export const generateSignupUsername = async (request: UsernameRequest): Promise<{ username: string }> => {
  return doJsonRequest<{ username: string }>('/auth/generate-username', 'POST', request);
};

export const signupParent = async (request: SignupRequest): Promise<AuthSession> => {
  return doJsonRequest<AuthSession>('/auth/signup', 'POST', request);
};
