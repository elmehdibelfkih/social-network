'use client'

import { useState } from 'react'
import styles from './styles.module.css'
import { LoginForm } from './login.client'
import { RegisterForm } from './signup.client'


export default function AuthForm({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className={styles.authCard}>
            <div className={styles.navButtons}>
                <button
                    className={`${styles.tabButton} ${isLogin ? styles.activeTab : ''}`}
                    onClick={() => { setIsLogin(true) }}>
                    Log In
                </button>
                <button
                    className={`${styles.tabButton} ${!isLogin ? styles.activeTab : ''}`}
                    onClick={() => { setIsLogin(false) }}>
                    Sign Up
                </button>
            </div>
            <div className={styles.formContent}>
                {isLogin ? <LoginForm onAuthSuccess={onAuthSuccess} /> : <RegisterForm onAuthSuccess={onAuthSuccess} />}
            </div>
        </div>
    )
}
