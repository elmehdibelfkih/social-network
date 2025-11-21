"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './services/auth';
import styles from './styles.module.css';
import { useAuth } from '../../providers/authProvider';

export function RegisterForm({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nickname: '',
        aboutMe: '',
        avatarId: 0,
    });
    const { setUser } = useAuth()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const resp = await authService.register(formData);
            setUser({
                userId: resp.userId,
                avatarId: resp.avatarId,
                nickname: resp.nickname,
                firstName: resp.firstName,
                lastName: resp.lastName
            })
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error("Failed to register:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const avatar = e.target.files?.[0];
        if (!avatar) return;

        try {
            const avatarId = await authService.uploadAvatar(avatar);

            setFormData(prev => ({ ...prev, avatarId }));
        } catch (error) {
            console.error("Failed to upload avatar:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>Sign Up</h2>
                <p className={styles.welcomeMsg}>Create your account to get started.</p>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="firstName">First Name *</label>
                    <input
                        type="text"
                        id="firstName"
                        placeholder="John"
                        className={styles.input}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                        type="text"
                        id="lastName"
                        placeholder="Doe"
                        className={styles.input}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="signUpEmail">Email *</label>
                <input
                    type="email"
                    id="signUpEmail"
                    placeholder="john.doe@example.com"
                    className={styles.input}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="signUpPassword">Password *</label>
                <input
                    type="password"
                    id="signUpPassword"
                    placeholder="Create a password"
                    className={styles.input}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="dob">Date of Birth *</label>
                <input
                    type="date"
                    id="dob"
                    className={styles.input}
                    required
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="nickname">Nickname (Optional)</label>
                <input
                    type="text"
                    id="nickname"
                    placeholder="@johndoe"
                    className={styles.input}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="aboutMe">About Me (Optional)</label>
                <textarea
                    id="aboutMe"
                    placeholder="Tell us about yourself"
                    className={`${styles.input} ${styles.textarea}`}
                    rows={3}
                    onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                ></textarea>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="avatar">Avatar (max size: 10 MB)</label>
                <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    className={`${styles.input} ${styles.fileInput}`}
                    onChange={handleUploadAvatar}
                />
            </div>

            <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
            >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
        </form>
    );
}