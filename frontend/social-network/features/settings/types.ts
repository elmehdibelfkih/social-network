export type SettingsTab = 'profile' | 'password' | 'privacy' | 'devices';

export type ProfileUpdateData = {
  firstName: string;
  lastName: string;
  nickname: string;
  aboutMe: string;
  dateOfBirth: string;
  avatarId?: number;
};

export type PasswordUpdateData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export { ProfileAPIResponse } from '@/libs/globalTypes';

export interface Session {
  sessionId: number;
  ipAddress: string;
  device: string;
  createdAt: string;
  current: boolean;
}