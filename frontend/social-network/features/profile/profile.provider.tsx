"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Stats as ProfileStats} from "@/libs/globalTypes";

type ProfileContextType = {
  stats: ProfileStats;
  incrementFollowers: () => void;
  decrementFollowers: () => void;
  incrementFollowing: () => void;
  decrementFollowing: () => void;
  incrementPosts: () => void;
  decrementPosts: () => void;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({
  children,
  initialStats,
}: {
  children: ReactNode;
  initialStats: ProfileStats;
}) => {
  const [stats, setStats] = useState<ProfileStats>(initialStats);

  const incrementFollowers = () => {
    setStats((prev) => ({
      ...prev,
      followersCount: prev.followersCount + 1,
    }));
  };

  const decrementFollowers = () => {
    setStats((prev) => ({
      ...prev,
      followersCount: prev.followersCount - 1,
    }));
  };

  const incrementFollowing = () => {
    setStats((prev) => ({
      ...prev,
      followingCount: prev.followingCount + 1,
    }));
  };

  const decrementFollowing = () => {
    setStats((prev) => ({
      ...prev,
      followingCount: prev.followingCount - 1,
    }));
  };

  const incrementPosts = () => {
    setStats((prev) => ({
      ...prev,
      postsCount: (prev.postsCount || 0) + 1,
    }));
  };

  const decrementPosts = () => {
    setStats((prev) => ({
      ...prev,
      postsCount: (prev.postsCount || 0) - 1,
    }));
  };

  return (
    <ProfileContext.Provider value={{ stats, incrementFollowers, decrementFollowers, incrementFollowing, decrementFollowing, incrementPosts, decrementPosts }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileStats = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfileStats must be used within ProfileProvider");
  return context;
};