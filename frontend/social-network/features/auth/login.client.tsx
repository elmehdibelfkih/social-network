"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './index';
import styles from './styles.module.css';
import { useAuth } from '@/providers/authProvider';

export function LoginForm({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        rememberMe: false
    });

    const { setUser } = useAuth()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const resp = await authService.login(formData);
            const newUser = {
                userId: resp.payload.userId,
                avatarId: resp.payload.avatarId,
                nickname: resp.payload.nickname,
                firstName: resp.payload.firstName,
                lastName: resp.payload.lastName
            };

            localStorage.setItem('social_network-user', JSON.stringify(newUser));
            setUser(newUser);
            router.push('/');
        } catch (error) {
            setIsLoading(false);
            console.error("Login failed:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Log In</h2>
                <p className={styles.welcomeMsg}>Wacha sahbi, dkhl dkhl rah bdina</p>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor='identifier'>Email or Nickname</label>
                <input
                    id="identifier"
                    type="text"
                    placeholder="Enter your email"
                    className={styles.input}
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    required
                    disabled={isLoading}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor='password'>Password</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    className={styles.input}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                />
            </div>

            <div className={styles.checkboxGroup}>
                <input
                    type="checkbox"
                    id="remember"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    disabled={isLoading}
                />
                <label htmlFor="remember">Remember Me</label>
            </div>

            <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
            >
                {isLoading ? 'Logging In...' : 'Log In'}
            </button>
        </form>
    );
}