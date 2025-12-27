"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './auth';
import styles from './styles.module.css';
import { useAuth } from '@/providers/authProvider';
import { ShowSnackbar } from '@/components/ui/snackbar/snackbar';

interface PasswordValidation {
    length: boolean;
    upper: boolean;
    lower: boolean;
    digit: boolean;
    special: boolean;
    noSpace: boolean;
}

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
        avatarId: null,
    });
    const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
        length: false,
        upper: false,
        lower: false,
        digit: false,
        special: false,
        noSpace: false,
    });
    const [showPasswordValidation, setShowPasswordValidation] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const { setUser } = useAuth()

    const validatePassword = (password: string): PasswordValidation => {
        return {
            length: /^.{8,64}$/.test(password),
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            digit: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password),
            noSpace: /^\S+$/.test(password),
        };
    };

    const isPasswordValid = (validation: PasswordValidation): boolean => {
        return Object.values(validation).every(v => v);
    };

    const handlePasswordChange = (password: string) => {
        setFormData({ ...formData, password });
        const validation = validatePassword(password);
        setPasswordValidation(validation);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isPasswordValid(passwordValidation)) {
            ShowSnackbar({ status: false, message: 'Please meet all password requirements.' });
            return;
        }

        setIsLoading(true);

        try {
            const resp = await authService.register(formData);
            console.log(resp)
            const newUser = {
                userId: String(resp.userId),
                avatarId: resp.avatarId,
                nickname: resp.nickname,
                firstName: resp.firstName,
                lastName: resp.lastName
            };

            localStorage.setItem('social_network-user', JSON.stringify(newUser));
            setUser(newUser);
            ShowSnackbar({ status: true, message: 'signup successfully.' });
            router.push('/');

        } catch (error) {
            console.error("Failed to register:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const avatar = e.target.files?.[0];
        if (!avatar) {
            setAvatarPreview(null);
            return;
        }

        if (avatar.size > 10 * 1024 * 1024) {
            ShowSnackbar({ status: false, message: "Avatar is too large. Maximum size is 10MB." });
            e.target.value = '';
            setAvatarPreview(null);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(avatar);

        try {
            const avatarResp = await authService.uploadAvatar(avatar);
            const avatarId = avatarResp?.mediaId
            setFormData(prev => ({ ...prev, avatarId: avatarId }));
        } catch (error) {
            console.error("Failed to upload avatar:", error);
            ShowSnackbar({ status: false, message: "Failed to upload avatar." });
            setAvatarPreview(null);
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
                        maxLength={50}

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
                        maxLength={50}

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
                    maxLength={256}
                    minLength={10}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label htmlFor="dob">Date of Birth *</label>
                    <input
                        type="date"
                        id="dob"
                        className={styles.input}
                        required
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: new Date(e.target.value).toISOString() })}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="nickname">Nickname</label>
                    <input
                        type="text"
                        id="nickname"
                        placeholder="@johndoe"
                        className={styles.input}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        maxLength={50}
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="signUpPassword">Password *</label>
                <div className={styles.passwordInputWrapper}>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="signUpPassword"
                        placeholder="Create a password"
                        className={styles.input}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        onFocus={() => setShowPasswordValidation(true)}
                        required
                        maxLength={64}
                        minLength={8}
                    />
                    <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                </div>
                {showPasswordValidation && (
                    <div className={styles.passwordRequirements}>
                        <div className={`${styles.requirement} ${passwordValidation.length ? styles.valid : ''}`}>
                            <span className={styles.checkmark}>{passwordValidation.length ? '✓' : '○'}</span>
                            8-64 characters
                        </div>
                        <div className={`${styles.requirement} ${passwordValidation.upper ? styles.valid : ''}`}>
                            <span className={styles.checkmark}>{passwordValidation.upper ? '✓' : '○'}</span>
                            One uppercase letter
                        </div>
                        <div className={`${styles.requirement} ${passwordValidation.lower ? styles.valid : ''}`}>
                            <span className={styles.checkmark}>{passwordValidation.lower ? '✓' : '○'}</span>
                            One lowercase letter
                        </div>
                        <div className={`${styles.requirement} ${passwordValidation.digit ? styles.valid : ''}`}>
                            <span className={styles.checkmark}>{passwordValidation.digit ? '✓' : '○'}</span>
                            One digit
                        </div>
                        <div className={`${styles.requirement} ${passwordValidation.special ? styles.valid : ''}`}>
                            <span className={styles.checkmark}>{passwordValidation.special ? '✓' : '○'}</span>
                            One special character (!@#$%^&*)
                        </div>
                        <div className={`${styles.requirement} ${passwordValidation.noSpace ? styles.valid : ''}`}>
                            <span className={styles.checkmark}>{passwordValidation.noSpace ? '✓' : '○'}</span>
                            No spaces
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="aboutMe">About Me</label>
                <textarea
                    id="aboutMe"
                    placeholder="Tell us about yourself"
                    className={`${styles.input} ${styles.textarea}`}
                    rows={2}
                    maxLength={2048}
                    minLength={5}
                    onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                ></textarea>
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="avatar">Avatar (max 10 MB)</label>
                <div className={styles.avatarUploadContainer}>
                    {avatarPreview && (
                        <div className={styles.avatarPreview}>
                            <img src={avatarPreview} alt="Avatar preview" />
                        </div>
                    )}
                    <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        className={`${styles.input} ${styles.fileInput}`}
                        onChange={handleUploadAvatar}
                    />
                </div>
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