import { createContext, useContext, useState } from "react"

type User = {
    userId: number
    avatarId: number
    nickname: string
    firstName: string
    lastName: string
}

type AuthContextType = {
    user: User
    setUser: (u: User) => void
}

const authContext = createContext<AuthContextType>(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState<User | null>(null)
    return (
        <authContext.Provider value={{ user, setUser }}>
            {children}
        </authContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(authContext)
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
    return ctx
}