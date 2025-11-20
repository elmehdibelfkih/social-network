'use client';

import { useState } from 'react';
import styles from './styles.module.css';

export function NavbarClient() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      {/* LEFT */}
      <div className={styles.navbarLeft}>
        <a href="/" aria-label="Go to homepage" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <img src="/users.svg" alt="" />
          </div>
          <span className={styles.brandText}>Social Network</span>
        </a>
      </div>

      {/* CENTER */}
      <div className={styles.navbarCenter}>
        <button className={`${styles.navLink} ${styles.active}`}>
          <img src="/home (1).svg" alt="Home" />
          <span>Home</span>
        </button>

        <button className={styles.navLink}>
          <img src="/searchb.svg" alt="Search" />
          <span>Search</span>
        </button>

        <button className={styles.navLink}>
          <img src="/groupb.svg" alt="Groups" />
          <span>Groups</span>
        </button>
      </div>

      {/* RIGHT */}
      <div className={styles.navbarRight}>
        <button className={styles.notificationBtn} aria-label="Notifications">
          <img src="/bell.svg" alt="Notifications" />
        </button>

        <div className={styles.userProfile} onClick={() => setOpen(!open)}>
          <div className={styles.userAvatar}>
            <img src="/users.svg" alt="Default Avatar" />
          </div>
          <span className={styles.userName}>John</span>
        </div>

        {open && (
          <div className={styles.profileMenu}>
            <button className={styles.menuItem}>
              <img src="/profile.svg" alt="" />
              <span>My Profile</span>
            </button>

            <button className={`${styles.menuItem} ${styles.logout}`}>
              <img src="/logout.svg" alt="" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
