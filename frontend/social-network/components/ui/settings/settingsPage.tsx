"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./settings.module.css";

interface SettingsProps {
  userId: number;
  children?: React.ReactNode;
}

export const Settings: React.FC<SettingsProps> = ({ userId, children }) => {
  const pathname = usePathname();

  return (
    <div className={styles.settingsLayout}>
      
      <aside className={styles.settingsSidebar}>
        <div className={styles.settingsHeader}>
          <h1>Settings</h1>
          <p>Manage your account preferences</p>
        </div> <hr/>

        <nav className={styles.settingsNav}>
          <ul>
            <li>
              <Link href="/settings/profile" className={pathname === "/settings/profile" ? styles.active : ""} > 👤 Profile Settings </Link>
            </li>
            <li>
              <Link href="/settings/security" className={pathname === "/settings/security" ? styles.active : ""} > 🛡️ Privacy & Security </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className={styles.settingsContent}>{children}</main>
    </div>
  );
};

// export default Settings;