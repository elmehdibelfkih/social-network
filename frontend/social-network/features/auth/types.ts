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