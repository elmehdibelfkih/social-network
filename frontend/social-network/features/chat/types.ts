

export interface User {
    userId: number
    email: string
    firstName: string
    lastName: string
    dateOfBirth: string
    nickname: string | null
    aboutMe: string | null
    avatarId: number | null
    online: boolean
}


export interface SocketMessage {
    type: string;
    payload?: any;
}

