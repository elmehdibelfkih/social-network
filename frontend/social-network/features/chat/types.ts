

export interface User {
    UserId: number
    Email: string
    FirstName: string
    LastName: string
    DateOfBirth: string
    Nickname: string | null
    AboutMe: string | null
    AvatarId: number | null
    Online: boolean
}

export interface SocketMessage {
    type: string;
    payload?: any;
}

