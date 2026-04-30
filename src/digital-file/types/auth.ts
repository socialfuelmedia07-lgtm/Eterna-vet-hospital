export type UserRole = 'parent' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
