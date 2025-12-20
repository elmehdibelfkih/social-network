'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { ProfileSettings } from './profile-settings.client';
import { PrivacySettings } from './privacy-settings.client';
import { DeviceSettings } from './device-settings.client';
import { SettingsTab, ProfileAPIResponse } from './types';
import { ProfileAPIResponse as GlobalProfileAPIResponse } from '@/libs/globalTypes';

export function SettingsClient({ profile }: { profile: GlobalProfileAPIResponse }) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences</p>
        
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Settings
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'privacy' ? styles.active : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy & Security
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'devices' ? styles.active : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            Manage Devices
          </button>
        </nav>
      </div>

      <div className={styles.content}>
        {activeTab === 'profile' && <ProfileSettings profile={profile} />}
        {activeTab === 'privacy' && <PrivacySettings profile={profile} />}
        {activeTab === 'devices' && <DeviceSettings />}
      </div>
    </div>
  );
}