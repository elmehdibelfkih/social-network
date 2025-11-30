import { ReactNode } from "react";
import { Navbar } from "@/features/navbar";
import { AuthProvider } from "@/providers/authProvider";


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthProvider>
        <Navbar />
        {children}
      </AuthProvider>
    </>
  );
}
