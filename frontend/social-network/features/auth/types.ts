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