'use client';

import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { http } from '@/libs/apiFetch';
import { ShowSnackbar } from '@/components/ui/snackbar/snackbar';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal/ConfirmationModal';

interface Session {
  sessionId: number;
  ipAddress: string;
  device: string;
  createdAt: string;
  current: boolean;
}

export function DeviceSettings() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await http.get<{ sessions: Session[] }>('/api/v1/sessions');
      setSessions(response?.sessions || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutDevice = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setShowLogoutConfirm(true);
  };

  const confirmLogoutDevice = async () => {
    if (!selectedSessionId) return;
    
    setShowLogoutConfirm(false);
    try {
      await http.delete(`/api/v1/sessions/${selectedSessionId}`);
      setSessions(prev => prev.filter(s => s.sessionId !== selectedSessionId));
      ShowSnackbar({ status: true, message: 'Device logged out successfully' });
    } catch (error) {
      console.error('Failed to logout device:', error);
      ShowSnackbar({ status: false, message: 'Failed to logout device' });
    } finally {
      setSelectedSessionId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getDeviceIcon = (device: string) => {
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('chrome')) return '🌐';
    if (deviceLower.includes('firefox')) return '🦊';
    if (deviceLower.includes('safari')) return '🧭';
    if (deviceLower.includes('android')) return '📱';
    if (deviceLower.includes('iphone') || deviceLower.includes('ios')) return '📱';
    if (deviceLower.includes('windows')) return '💻';
    if (deviceLower.includes('mac')) return '💻';
    if (deviceLower.includes('linux')) return '🐧';
    return '💻';
  };

  const getDeviceType = (device: string) => {
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('android') || deviceLower.includes('iphone') || deviceLower.includes('mobile')) return 'Mobile';
    if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) return 'Tablet';
    return 'Computer';
  };

  const getBrowserName = (device: string) => {
    if (device.includes('Chrome')) return 'Chrome';
    if (device.includes('Firefox')) return 'Firefox';
    if (device.includes('Safari')) return 'Safari';
    if (device.includes('Edge')) return 'Edge';
    return device.split('/')[0] || 'Unknown Browser';
  };

  const formatIpAddress = (ip: string) => {
    // Handle IPv6 localhost
    if (ip === '::1' || ip.startsWith('[::1]')) return 'localhost';
    // Handle IPv4 localhost
    if (ip === '127.0.0.1') return 'localhost';
    // Handle IPv6 addresses
    if (ip.includes(':') && ip.length > 15) return 'IPv6 address';
    // Return IPv4 as is
    return ip;
  };

  if (isLoading) {
    return <div className={styles.section}>Loading devices...</div>;
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Manage Devices</h2>
      <p className={styles.sectionDesc}>See all devices where your account is logged in and manage them</p>

      <div className={styles.devicesGrid}>
        {sessions.map((session) => (
          <div key={session.sessionId} className={`${styles.deviceCard} ${session.current ? styles.currentDevice : ''}`}>
            <div className={styles.deviceHeader}>
              <div className={styles.deviceIconWrapper}>
                <span className={styles.deviceIcon}>{getDeviceIcon(session.device)}</span>
              </div>
              <div className={styles.deviceMainInfo}>
                <div className={styles.deviceTitle}>
                  {getBrowserName(session.device)} • {getDeviceType(session.device)}
                  {session.current && <span className={styles.currentLabel}>This device</span>}
                </div>
                <div className={styles.deviceSubtitle}>
                  {formatIpAddress(session.ipAddress)} • Last active {formatDate(session.createdAt)}
                </div>
              </div>
            </div>
            
            {!session.current && (
              <div className={styles.deviceActions}>
                <button
                  className={styles.signOutBtn}
                  onClick={() => handleLogoutDevice(session.sessionId)}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title="Log Out Device"
        message="Are you sure you want to log out this device? You'll need to sign in again on that device."
        onConfirm={confirmLogoutDevice}
        onCancel={() => { setShowLogoutConfirm(false); setSelectedSessionId(null); }}
      />
    </div>
  );
}