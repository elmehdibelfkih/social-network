'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { http } from '@/libs/apiFetch';
import { authService } from '@/features/auth';
import { ProfileAPIResponse } from '@/libs/globalTypes';
import { useUserStats } from '@/providers/userStatsContext';
import { useAuth } from '@/providers/authProvider';
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal/ConfirmationModal';

export function ProfileSettings({ profile }: { profile: ProfileAPIResponse }) {
  const { dispatch } = useUserStats();
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    nickname: profile.nickname || '',
    email: profile.email || '',
    aboutMe: profile.aboutMe || '',
    dateOfBirth: profile.dateOfBirth || '',
    avatarId: profile.avatarId || null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAvatarConfirm, setShowAvatarConfirm] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmUpdate = async () => {
    setIsLoading(true);
    setShowConfirmation(false);

    try {
      await http.put(`/api/v1/users/${profile.userId}/profile`, formData);

      dispatch({ type: 'SET_FIRST_NAME', payload: formData.firstName });
      dispatch({ type: 'SET_LAST_NAME', payload: formData.lastName });
      dispatch({ type: 'SET_NICKNAME', payload: formData.nickname });
      dispatch({ type: 'SET_ABOUT_ME', payload: formData.aboutMe });
      dispatch({ type: 'SET_DATE_OF_BIRTH', payload: formData.dateOfBirth });
      dispatch({ type: 'SET_AVATAR_ID', payload: formData.avatarId });

      // Update auth provider with new email
      if (user) {
        const updatedUser = { ...user, email: formData.email, nickname: formData.nickname };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingAvatarFile(file);
    setShowAvatarConfirm(true);
  };

  const confirmAvatarUpload = async () => {
    if (!pendingAvatarFile) return;
    setShowAvatarConfirm(false);

    try {
      const response = await authService.uploadAvatar(pendingAvatarFile);
      const newFormData = { ...formData, avatarId: response.mediaId };
      setFormData(newFormData);

      // Save avatar immediately to backend
      await http.put(`/api/v1/users/${profile.userId}/profile`, { ...formData, avatarId: response.mediaId });
      dispatch({ type: 'SET_AVATAR_ID', payload: response.mediaId });

      // Update auth provider for NewPost component
      if (user) {
        const updatedUser = { ...user, avatarId: response.mediaId };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setPendingAvatarFile(null);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const newFormData = { ...formData, avatarId: null };
      setFormData(newFormData);

      await http.put(`/api/v1/users/${profile.userId}/profile`, { ...formData, avatarId: null });
      dispatch({ type: 'SET_AVATAR_ID', payload: null });

      if (user) {
        const updatedUser = { ...user, avatarId: null };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to remove avatar:', error);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Profile Settings</h2>
      <p className={styles.sectionDesc}>Update your personal information and profile details</p>

      <div className={styles.avatarSection}>
        <h3>Profile Photo</h3>
        <p>Update your profile picture</p>
        <div className={styles.avatarControls}>
          <AvatarHolder avatarId={formData.avatarId} size={80} />
          <div className={styles.avatarButtons}>
            <label className={styles.uploadBtn}>
              Upload Photo
              <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
            </label>
            <button className={styles.removeBtn} onClick={handleRemoveAvatar}>Remove</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              maxLength={50}
            />
          </div>
          <div className={styles.field}>
            <label>Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              maxLength={50}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Nickname</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            placeholder="Your username"
            required
            maxLength={50}

          />
        </div>

        <div className={styles.field}>
          <label>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            maxLength={256}
          />
        </div>

        <div className={styles.field}>
          <label>Bio</label>
          <textarea
            value={formData.aboutMe}
            onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
            placeholder="Brief description for your profile"
            maxLength={2048}

          />
        </div>

        <div className={styles.field}>
          <label>Birthday</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn}>Cancel</button>
          <button type="submit" className={styles.saveBtn} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <ConfirmationModal
        isOpen={showAvatarConfirm}
        title="Update Profile Photo"
        message="Are you sure you want to change your profile photo?"
        onConfirm={confirmAvatarUpload}
        onCancel={() => { setShowAvatarConfirm(false); setPendingAvatarFile(null); }}
      />

      <ConfirmationModal
        isOpen={showConfirmation}
        title="Confirm Profile Update"
        message="Are you sure you want to save these changes to your profile?"
        onConfirm={confirmUpdate}
        onCancel={() => setShowConfirmation(false)}
      />
    </div>
  );
}