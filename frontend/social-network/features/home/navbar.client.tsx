'use client';

import styles from '../../styles/components/navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles['navbar-continer']}>
            <div className={styles.vanbarleft}>
                <a href="/" aria-label="Go to homepage" className={styles['logo-link']}>
                    <div className={styles['logo-icon']}>
                        <img src="/users.svg" alt="" />
                    </div>
                    <span className={styles['brand-text']}>Social Network</span>
                </a>
            </div>

            <div className={styles['navbar-center']}>
                <a href="#" className={`${styles['nav-link']} ${styles.active}`}>
                    <img src="/home (1).svg" alt="Home" />
                    <span>Home</span>
                </a>
                <button className={styles['nav-link']}>
                    <img src="/searchb.svg" alt="Search" />
                    <span>Search</span>
                </button>
                <button className={styles['nav-link']}>
                    <img src="/groupb.svg" alt="Groups" />
                    <span>Groups</span>
                </button>
            </div>

            <div className={styles['navbar-right']}>
                <button className={styles['notification-btn']} aria-label="Notifications">
                    <img src="/bell.svg" alt="Notifications" />
                    <span className={styles['notification-badge']}>1</span>
                </button>

                <button className={styles['user-profile']} aria-label="User profile">
                    <div className={styles['user-avatar']}></div>
                    <span className={styles['user-name']}>User</span>
                </button>
            </div>
        </nav>
    );
}