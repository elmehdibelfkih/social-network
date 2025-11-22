'use client'
import { createContext, useContext, useState, useEffect } from "react"

type User = {
    userId: number
    avatarId: number | null
    nickname: string
    firstName: string
    lastName: string
}

type AuthContextType = {
    user: User | null
    setUser: (u: User | null) => void
}

const authContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('social_network-user')
            if (stored) {
                try {
                    return JSON.parse(stored)
                } catch {
                    return null
                }
            }
        }
        return null
    })

    useEffect(() => {
        if (user) {
            localStorage.setItem('social_network-user', JSON.stringify(user))
        } else {
            localStorage.removeItem('social_network-user')
        }
    }, [user])

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