type RegisterRequest = {
    email: string
    password: string
    firstName: string
    lastName: string
    dateOfBirth: string
    nickname?: string
    aboutme?: string
    avatarId?: Number
}

type LoginRequest = {
    "email/userId/nickname": string
    password: string
    rememberMe: boolean
}

type RegisterResponse = {
    userId: Number
    email: string
    firstName: string
    lastName: string
    dateOfBirth: string
    nickname?: string
    aboutme?: string
    avatarId?: Number
}

type LoginResponse = {
    userId: Number
    email: string
    firstName: string
    lastName: string
    dateOfBirth: string
    nickname?: string
    aboutme?: string
    avatarId?: Number
}

type AuthResponse = {
    sessionId: Number
    sessionToken: string
    ipAddress: string
    device: string
    createdAt: string
    expiresAt: string
}

type SessionListResponse = {
    sessionId: Number
    ipAddress: string
    device: string
    createdAt: string
    expiresAt: string
    current: boolean
}
