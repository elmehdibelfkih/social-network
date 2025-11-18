// @ts-ignore
import { apiClient } from '@/libs/apiClient';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  SessionListResponse
  // @ts-ignore
} from '../types.ts';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post('/api/v1/auth/register', data);
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const payload: LoginRequest = {
      "email/userId/nickname": data.identifier,
      password: data.password,
      rememberMe: data.rememberMe,
    };
    return apiClient.post('/api/v1/auth/login', payload);
  },

  async uploadAvatar(file: File): Promise<number> {
    if (!file) throw new Error("No file provided")

    const encodedFile = await this.avatarToBase64(file)
    const rawEncodedFile = encodedFile.split(',')[1]

    const payload = {
      fileName: file.name,
      fileType: file.type,
      fileData: rawEncodedFile,
      purpose: "avatar"
    }

    const response = await apiClient.post('/api/v1/media/upload', payload)
    return response.payload.mediaId
  },

  async logout(): Promise<void> {
    return apiClient.post('/api/v1/auth/logout', {});
  },

  async getSession(): Promise<AuthResponse> {
    return apiClient.get('/api/v1/auth/session');
  },

  async getActiveSessions(): Promise<SessionListResponse> {
    return apiClient.get('/api/v1/sessions');
  },

  async revokeSession(sessionId: number): Promise<void> {
    return apiClient.delete(`/api/v1/sessions/${sessionId}`);
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