'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { http } from '@/libs/apiFetch';
import { ProfileAPIResponse } from '@/libs/globalTypes';
import { ShowSnackbar } from '@/components/ui/snackbar/snackbar';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal/ConfirmationModal';

export function PasswordSettings({ profile }: { profile: ProfileAPIResponse }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmUpdate = async () => {
    setIsLoading(true);
    setShowConfirmation(false);

    try {
      if (!formData.currentPassword.trim() || !formData.newPassword.trim()) {
        ShowSnackbar({ status: false, message: 'Both current and new password are required' });
        setIsLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        ShowSnackbar({ status: false, message: 'New passwords do not match' });
        setIsLoading(false);
        return;
      }

      const res = await http.patch(`/api/v1/users/${profile.userId}/password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      if (res) {
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        ShowSnackbar({ status: true, message: 'Password updated successfully' });
      }
      
    } catch (error: any) {
      console.error('Failed to update password:', error);
      const errorMsg = error?.error?.errorMessage || 'Failed to update password';
      ShowSnackbar({ status: false, message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Password Settings</h2>
      <p className={styles.sectionDesc}>Change your account password</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Current Password</label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            placeholder="Enter current password"
            required
          />
        </div>

        <div className={styles.field}>
          <label>New Password</label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="Enter new password"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Confirm New Password</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
            required
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn}>Cancel</button>
          <button type="submit" className={styles.saveBtn} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showConfirmation}
        title="Confirm Password Change"
        message="Are you sure you want to change your password?"
        onConfirm={confirmUpdate}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
}