// notification.server.tsx
// Minimal server component (no "use client")

import type { ReactNode } from "react";

interface NotificationServerProps {
  children?: ReactNode;
}

export default function NotificationServer(_props: NotificationServerProps) {
  return <div className="notification">{/* server-rendered: NotificationServer */}</div>;
}
