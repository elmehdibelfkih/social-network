'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { http } from '@/libs/apiFetch';
import { ProfileAPIResponse } from '@/libs/globalTypes';
import { useUserStats } from '@/providers/userStatsContext';
import { ShowSnackbar } from '@/components/ui/snackbar/snackbar';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal/ConfirmationModal';

export function PrivacySettings({ profile }: { profile: ProfileAPIResponse }) {
  const { state, dispatch } = useUserStats();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingPrivacy, setPendingPrivacy] = useState<'public' | 'private'>('public');

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

    setShowPasswordConfirm(true);
  };

  const confirmPasswordUpdate = async () => {
    setIsLoading(true);
    setShowPasswordConfirm(false);
    try {
      await http.put(`/api/v1/users/${profile.userId}/profile`, {
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
    setPendingPrivacy(privacy);
    setShowPrivacyConfirm(true);
  };

  const confirmPrivacyUpdate = async () => {
    setShowPrivacyConfirm(false);
    try {
      await http.put(`/api/v1/users/${profile.userId}/privacy`, { privacy: pendingPrivacy });
      dispatch({ type: 'SET_PRIVACY', payload: pendingPrivacy });
    } catch (error) {
      console.error('Failed to update privacy:', error);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      await http.put(`/api/v1/users/${profile.userId}/profile`, { deleteAccount: true });
      // Logout and redirect
      await http.post('/api/v1/auth/logout');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Failed to delete account:', error);
      ShowSnackbar({ status: false, message: 'Failed to delete account' });
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
        <button className={styles.deleteBtn} onClick={handleDeleteAccount}>Delete Account</button>
      </div>

      <ConfirmationModal
        isOpen={showPasswordConfirm}
        title="Confirm Password Change"
        message="Are you sure you want to change your password? You will need to use the new password to login."
        onConfirm={confirmPasswordUpdate}
        onCancel={() => setShowPasswordConfirm(false)}
      />

      <ConfirmationModal
        isOpen={showPrivacyConfirm}
        title="Confirm Privacy Change"
        message={`Are you sure you want to make your profile ${pendingPrivacy}?`}
        onConfirm={confirmPrivacyUpdate}
        onCancel={() => setShowPrivacyConfirm(false)}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone."
        onConfirm={confirmDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}