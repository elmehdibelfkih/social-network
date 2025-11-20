import { http } from '../../../libs/apiClient';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  SessionListResponse,
  UploadMediaResponse
} from '../types';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return http.post('/api/v1/auth/register', data);
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    return http.post('/api/v1/auth/login', data);
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

    const resp = await http.post<UploadMediaResponse>('/api/v1/media/upload', payload)
    return resp.payload.mediaId
  },

  async logout(): Promise<void> {
    return http.post('/api/v1/auth/logout', {});
  },

  async getSession(): Promise<AuthResponse> {
    return http.get('/api/v1/auth/session');
  },

  async getActiveSessions(): Promise<SessionListResponse> {
    return http.get('/api/v1/sessions');
  },

  async revokeSession(sessionId: number): Promise<void> {
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