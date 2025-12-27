'use client';

import { SocialIcon } from '@/components/ui/icons';
import NavbarCenter, { NavProfile } from './navbar.client';
import styles from './styles.module.css';
import { Notifications } from '../notifications';
import { useState, useRef, useEffect } from 'react';
import { ChatSection } from '../chat';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={chatRef} style={{ position: 'relative' }}>
      <button 
        className={styles.chatButton} 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </button>
      {isOpen && (
        <div className={`${styles.chatPopout} ${styles.open}`}>
          <ChatSection />
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <a href="/" aria-label="Go to homepage" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <SocialIcon />
          </div>
          <span className={styles.brandText}>Social Network</span>
        </a>
      </div>
      <NavbarCenter />
      <NotificationClient />
      <NavProfile />
    </nav>
  );
}

export function NotificationClient() {
  return (
    <div className={styles.navbarRight}>
      <Notifications />
      <ChatButton />
    </div>
  )
}