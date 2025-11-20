'use client';

import styles from './styles.module.css';
import { useNavbar } from './hooks/useNavbar';

export function NavbarClient() {
  const { user, notificationCount, activeTab, setActiveTab } = useNavbar();

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
        <button 
          className={`${styles.navLink} ${activeTab === 'home' ? styles.active : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <img src="/home (1).svg" alt="Home" />
          <span>Home</span>
        </button>
        <button 
          className={`${styles.navLink} ${activeTab === 'search' ? styles.active : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <img src="/searchb.svg" alt="Search" />
          <span>Search</span>
        </button>
        <button 
          className={`${styles.navLink} ${activeTab === 'groups' ? styles.active : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          <img src="/groupb.svg" alt="Groups" />
          <span>Groups</span>
        </button>
      </div>

      <div className={styles.navbarRight}>
        <button className={styles.notificationBtn} aria-label="Notifications">
          <img src="/bell.svg" alt="Notifications" />
          {notificationCount > 0 && (
            <span className={styles.notificationBadge}>{notificationCount}</span>
          )}
        </button>

        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            <img src="/users.svg" alt="Default Avatar" />
          </div>
          <span className={styles.userName}>
            {user?.nickname || `${user?.firstName} ${user?.lastName}` || 'User'}
          </span>
        </div>
      </div>
    </nav>
  );
}