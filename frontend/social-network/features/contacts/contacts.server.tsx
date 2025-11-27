// contacts.server.tsx
// Minimal server component (no "use client")

import type { ReactNode } from "react";

interface ContactsServerProps {
  children?: ReactNode;
}

export default function ContactsServer(_props: ContactsServerProps) {
  return <div className="contacts">{/* server-rendered: ContactsServer */}</div>;
}
