import { ReactNode } from "react";
import { NavbarClient } from "@/features/navbar";
import { AuthProvider } from "@/providers/authProvider";


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthProvider>
        <NavbarClient />
        {/* <ProfileFeed userId={"7940237930139648"} /> */}
        {children}
      </AuthProvider>
    </>
  );
}
