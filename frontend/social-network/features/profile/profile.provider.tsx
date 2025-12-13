"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ProfileState = {
  count: number;
  toggleFollow: () => void;
};

const ProfileContext = createContext<ProfileState | null>(null);

export const ProfileProvider = ({ 
  children, 
  initialCount 
}: { 
  children: ReactNode; 
  initialCount: number 
}) => {
  const [count, setCount] = useState(initialCount);

  const toggleFollow = () => {
    setCount((prev) => prev + 1); 
  };

  return (
    <ProfileContext.Provider value={{ count, toggleFollow }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};