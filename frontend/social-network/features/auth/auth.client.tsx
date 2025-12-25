'use client'

import { useState } from 'react'
import styles from './styles.module.css'
import { LoginForm } from './login.client'
import { RegisterForm } from './signup.client'


export default function AuthForm({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
    const [isLogin, setIsLogin] = useState(true)

    return (
        <div className={styles.authCard}>
            <div className={styles.leftPanel}>
                <h1>Welcome to Social Network</h1>
                <p>Connect with friends, share moments, and build communities together.</p>
            </div>
            <div className={styles.rightPanel}>
                <div className={styles.loginContainer}>
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
            </div>
        </div>
    )
}
