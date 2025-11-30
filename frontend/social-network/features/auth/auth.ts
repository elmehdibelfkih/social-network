import { http } from '@/libs/apiFetch';
import type {
  LoginRequest,
  RegisterRequest
} from './types';

import { Session, AuthResponse, MediaUploadResponse } from '@/libs/globalTypes';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return http.post<AuthResponse>('/api/v1/auth/register', data)
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const payload: LoginRequest = {
      identifier: data.identifier,
      password: data.password,
      rememberMe: data.rememberMe,
    };
    return http.post('/api/v1/auth/login', payload)
  },

  async uploadAvatar(file: File): Promise<MediaUploadResponse> {
    if (!file) throw new Error("No file provided")

    const encodedFile = await this.avatarToBase64(file)
    const rawEncodedFile = encodedFile.split(',')[1]

    const payload = {
      fileName: file.name,
      fileType: file.type,
      fileData: rawEncodedFile,
      purpose: "avatar"
    }
    return await http.post<MediaUploadResponse>('/api/v1/media/upload', payload)
  },

  async logout(): Promise<void> {
    http.post('/api/v1/auth/logout', {})
  },

  async getSession(): Promise<AuthResponse> {
    return http.get('/api/v1/auth/session')
  },

  async getActiveSessions(): Promise<Session> {
    return http.get('/api/v1/sessions');
  },

  async deleteSession(sessionId: number): Promise<void> {
    return http.delete(`/api/v1/sessions/${sessionId}`);
  },

  avatarToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }
};