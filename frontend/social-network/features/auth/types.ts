export type RegisterRequest = {
    email: string
    password: string
    firstName: string
    lastName: string
    dateOfBirth: string
    nickname?: string
    aboutme?: string
    avatarId?: Number
}

export type LoginRequest = {
    identifier: string
    password: string
    rememberMe: boolean
}

export type RegisterResponse = {
    userId: Number
    email: string
    firstName: string
    lastName: string
    dateOfBirth: string
    nickname?: string
    aboutme?: string
    avatarId?: Number
}

export type LoginResponse = {
    userId: Number
    email: string
    firstName: string
    lastName: string
    dateOfBirth: string
    nickname?: string
    aboutme?: string
    avatarId?: Number
}

export type AuthResponse = {
    sessionId: Number
    sessionToken: string
    ipAddress: string
    device: string
    createdAt: string
    expiresAt: string
}

export type SessionListResponse = {
    sessionId: Number
    ipAddress: string
    device: string
    createdAt: string
    expiresAt: string
    current: boolean
}
