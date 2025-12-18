'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { http } from '@/libs/apiFetch';
import { ProfileAPIResponse } from '@/libs/globalTypes';
import { useUserStats } from '@/providers/userStatsContext';
import { ShowSnackbar } from '@/components/ui/snackbar/snackbar';

export function PrivacySettings({ profile }: { profile: ProfileAPIResponse }) {
  const { state, dispatch } = useUserStats();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      ShowSnackbar({ status: false, message: 'All fields are required' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      ShowSnackbar({ status: false, message: 'New passwords do not match' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      ShowSnackbar({ status: false, message: 'New password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);
    try {
      await http.put(`/api/v1/users/${profile.userId}/profile`, {
        ...profile,
        currentPassword: passwords.currentPassword,
        password: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      ShowSnackbar({ status: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Failed to update password:', error);
      ShowSnackbar({ status: false, message: 'Failed to update password. Check current password and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyToggle = async (privacy: 'public' | 'private') => {
    try {
      await http.put(`/api/v1/users/${profile.userId}/privacy`, { privacy });
      dispatch({ type: 'SET_PRIVACY', payload: privacy });
    } catch (error) {
      console.error('Failed to update privacy:', error);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Privacy & Security</h2>
      <p className={styles.sectionDesc}>Manage your account security and privacy preferences</p>

      <div className={styles.passwordSection}>
        <h3>Change Password</h3>
        <p>Update your password regularly to keep your account secure</p>
        
        <form onSubmit={handlePasswordUpdate} className={styles.form}>
          <div className={styles.field}>
            <label>Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label>New Password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className={styles.field}>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className={styles.updateBtn} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className={styles.privacySection}>
        <h3>Privacy Settings</h3>
        <p>Control who can see your information</p>
        
        <div className={styles.privacyOptions}>
          <div className={styles.privacyOption}>
            <h4>Profile Visibility</h4>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  name="profileVisibility"
                  checked={state.privacy === 'public'}
                  onChange={() => handlePrivacyToggle('public')}
                />
                Public - Everyone can see your profile
              </label>
              <label>
                <input
                  type="radio"
                  name="profileVisibility"
                  checked={state.privacy === 'private'}
                  onChange={() => handlePrivacyToggle('private')}
                />
                Private - Only you can see your profile
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3>Danger Zone</h3>
        <p>Irreversible actions</p>
        <button className={styles.deleteBtn}>Delete Account</button>
      </div>
    </div>
  );
}