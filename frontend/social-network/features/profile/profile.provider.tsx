"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ProfileState = {
  count: number;
  toggleFollow: () => void;
};

const ProfileContext = createContext<ProfileState | null>(null);

// 1. Accepts 'initialCount' from the Server
export const ProfileProvider = ({ 
  children, 
  initialCount 
}: { 
  children: ReactNode; 
  initialCount: number 
}) => {
  // 2. Hydrate Server Data into Client State
  const [count, setCount] = useState(initialCount);

  const toggleFollow = () => {
    // In a real app, you would also call a Server Action here
    setCount((prev) => prev + 1); 
  };

  return (
    <ProfileContext.Provider value={{ count, toggleFollow }}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom Hook for easier consumption
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};