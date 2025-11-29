'use client';

import styles from './styles.module.css';
import type { ProfileAPIResponse } from '@/libs/globalTypes'
import AvatarHolder from '@/components/ui/avatar_holder/avatarholder.client';
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getProfileServer } from '../mini_profile';
import { getUserId } from '@/libs/helpers';
import { SettingsIcon, ProfileIcon, LogoutIcon, HomeIcon, GroupsIcon, SearchIcon, BellIcon } from '@/components/ui/icons';

type Props = {
  userId?: string | number
  data?: ProfileAPIResponse
}

export function NavProfile({ userId: initialUserId, data: initialData }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileAPIResponse | null>(initialData ?? null);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      let uid = initialUserId ?? null;
      if (!uid) {
        try {
          uid = await getUserId();
        } catch {
          uid = null;
        }
      }
      let p: ProfileAPIResponse | null = initialData ?? null;
      if (!p && uid != null) {
        try {
          p = await getProfileServer(uid);
        } catch {
          p = null;
        }
      }
      if (!p && mounted) {
        p = {
          userId: Number(uid ?? 0),
          status: null,
          nickname: null,
          firstName: "",
          lastName: "",
          avatarId: null,
          aboutMe: null,
          dateOfBirth: null,
          privacy: "public",
          stats: { postsCount: 0, followersCount: 0, followingCount: 0 },
          joinedAt: null,
          chatId: null,
        };
      }
      if (mounted) {
        setProfile(p);
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [initialUserId, initialData]);

  const displayName = profile?.nickname ?? profile?.firstName ?? "";

  return (
    <>
      <div
        className={styles.userProfile}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
      >
        <AvatarHolder avatarId={profile?.avatarId ?? null} size={40} />
        <span className={styles.userName}>{displayName}</span>
      </div>

      {open && (
        <div className={styles.profileMenu}>

          <button
            className={styles.menuItem}
            type="button"
            onClick={() => router.push(`/profile/${profile?.userId}`)}
          >
            <ProfileIcon />
            <span>My Profile</span>
          </button>

          <button
            className={styles.menuItem}
            type="button"
            onClick={() => router.push("/settings")}
          >
            <SettingsIcon />
            <span>Settings</span>
          </button>

          <button
            className={`${styles.menuItem} ${styles.logout}`}
            type="button"
            onClick={() => router.push("/logout")}
          >
            <LogoutIcon />
            <span>Log Out</span>
          </button>

        </div>
      )}
    </>
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

export function NotificationClient() {
  return (
    <div className={styles.navbarRight}>
      <button className={styles.notificationBtn} aria-label="Notifications">
        <BellIcon /> 
        {/* <p>Notifications</p> */}
      </button>
    </div>
  )
}