// profile_feed.server.tsx
// Minimal server component (no "use client")

import type { ReactNode } from "react";

interface ProfileFeedServerProps {
  children?: ReactNode;
}

export default function ProfileFeedServer(_props: ProfileFeedServerProps) {
  return <div className="profile_feed">{/* server-rendered: ProfileFeedServer */}</div>;
}
