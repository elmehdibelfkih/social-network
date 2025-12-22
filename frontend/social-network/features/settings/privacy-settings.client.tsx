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
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivacyConfirm, setShowPrivacyConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingPrivacy, setPendingPrivacy] = useState<'public' | 'private'>('public');

  const handlePrivacyToggle = async (privacy: 'public' | 'private') => {
    setPendingPrivacy(privacy);
    setShowPrivacyConfirm(true);
  };

  const confirmPrivacyUpdate = async () => {
    setShowPrivacyConfirm(false);
    try {
      await http.patch(`/api/v1/users/${profile.userId}/privacy`, { privacy: pendingPrivacy });
      dispatch({ type: 'SET_PRIVACY', payload: pendingPrivacy });
      ShowSnackbar({ status: true, message: 'Privacy settings updated successfully' });
    } catch (error) {
      console.error('Failed to update privacy:', error);
      ShowSnackbar({ status: false, message: 'Failed to update privacy settings' });
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      await http.patch(`/api/v1/users/${profile.userId}/profile`, { deleteAccount: true });
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
      <p className={styles.sectionDesc}>Manage your account privacy preferences</p>

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