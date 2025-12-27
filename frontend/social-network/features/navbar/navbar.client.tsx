'use client';

import styles from './styles.module.css';
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client';
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SettingsIcon, ProfileIcon, LogoutIcon, HomeIcon, GroupsIcon, SearchIcon } from '@/components/ui/icons';
import { http } from '@/libs/apiFetch';
import { useAuth } from '@/providers/authProvider';
import { ShowSnackbar } from '@/components/ui/snackbar/snackbar';
import { useUserStats } from '@/providers/userStatsContext';

export function NavProfile() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { setUser } = useAuth();
  const { state } = useUserStats();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleLogout = async () => {
    try {
      await http.post('/api/v1/auth/logout');

      localStorage.clear();
      sessionStorage.clear();

      setUser(null);
      ShowSnackbar({ status: true, message: 'Logged out successfully.' });
      router.push('/auth');
    } catch (error) {
      console.error('Logout failed', error);

      // Clear storage even if logout request fails
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      router.push('/auth');
    }
  };

  const displayName = state?.nickname ?? state?.firstName ?? "";

  return (
    <div ref={menuRef}>
      <div
        className={styles.userProfile}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
      >
        <AvatarHolder avatarId={state?.avatarId ?? null} size={40} />
        <span className={styles.userName}>{displayName}</span>
      </div>

      {open && (
        <div className={styles.profileMenu}>

          <button
            className={styles.menuItem}
            type="button"
            onClick={() => {
              router.push(`/profile/`);
              setOpen(false);
            }}
          >
            <ProfileIcon />
            <span>My Profile</span>
          </button>

          <button
            className={styles.menuItem}
            type="button"
            onClick={() => {
              router.push(`/settings`);
              setOpen(false);
            }}
          >
            <SettingsIcon />
            <span>Settings</span>
          </button>

          <button
            className={`${styles.menuItem} ${styles.logout}`}
            type="button"
            onClick={handleLogout}
          >
            <LogoutIcon />
            <span>Log Out</span>
          </button>

        </div>
      )}
    </div>
  );
}

export default function NavbarCenter() {
  const router = useRouter();
  const pathname = usePathname();

  const navigateIfDifferent = (route: string) => {
    if (pathname !== route) {
      router.push(route);
    }
  };

  return (
    <div className={styles.navbarCenter}>

      <button
        onClick={() => navigateIfDifferent("/")}
        className={`${styles.navLink} ${pathname === "/" ? styles.active : ""}`}
      >
        <HomeIcon />
        <span>Home</span>
      </button>

      <button
        onClick={() => navigateIfDifferent("/search")}
        className={`${styles.navLink} ${pathname === "/search" ? styles.active : ""}`}
      >
        <SearchIcon />
        <span>Search</span>
      </button>

      <button
        onClick={() => navigateIfDifferent("/groups")}
        className={`${styles.navLink} ${pathname === "/groups" ? styles.active : ""}`}
      >
        <GroupsIcon />
        <span>Groups</span>
      </button>

    </div>
  );
}
