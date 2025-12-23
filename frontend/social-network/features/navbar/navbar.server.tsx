import { SocialIcon } from '@/components/ui/icons';
import NavbarCenter, { NavProfile } from './navbar.client';
import styles from './styles.module.css';
import { Notifications } from '../notifications';

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
    </div>
  )
}