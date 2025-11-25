import { ReactNode } from "react";
import { NavbarClient } from "@/features/navbar";
import { AuthProvider } from "@/providers/authProvider";


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthProvider>
        <NavbarClient />
        {children}
      </AuthProvider>
    </>
  );
}
