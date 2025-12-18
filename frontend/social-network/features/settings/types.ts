export type SettingsTab = 'profile' | 'privacy';

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