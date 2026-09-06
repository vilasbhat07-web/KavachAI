export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
}
