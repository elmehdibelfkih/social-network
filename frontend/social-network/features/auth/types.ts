export type RegisterRequest = {
    email: string
    password: string
    firstName: string
    lastName: string
    dateOfBirth: string
    nickname?: string
    aboutme?: string
    avatarId?: number
}

export type LoginRequest = {
    identifier: string
    password: string
    rememberMe: boolean
}

export interface Session {
    sessionId: number;
    sessionToken?: string;
    ipAddress: string;
    device: string;
    createdAt: string;
    expiresAt: string;
    current?: boolean;
}

export interface AuthResponse {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nickname: string | null;
    aboutMe: string | null;
    avatarId: number | null;
}
