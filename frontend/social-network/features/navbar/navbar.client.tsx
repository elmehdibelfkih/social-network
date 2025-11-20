'use client';

import styles from './styles.module.css';

export function NavbarClient() {
  // No hooks, no state

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <a href="/" aria-label="Go to homepage" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <img src="/users.svg" alt="" />
          </div>
          <span className={styles.brandText}>Social Network</span>
        </a>
      </div>

      <div className={styles.navbarCenter}>
        <button className={styles.navLink}>
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

      <div className={styles.navbarRight}>
        <button className={styles.notificationBtn} aria-label="Notifications">
          <img src="/bell.svg" alt="Notifications" />
        </button>

        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            <img src="/users.svg" alt="Default Avatar" />
          </div>
          <span className={styles.userName}>User</span>
        </div>
      </div>
    </nav>
  );
}
