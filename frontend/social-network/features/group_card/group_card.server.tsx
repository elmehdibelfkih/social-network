// group_card.server.tsx
// Minimal server component (no "use client")

import type { ReactNode } from "react";

interface GroupCardServerProps {
  children?: ReactNode;
}

export default function GroupCardServer(_props: GroupCardServerProps) {
  return <div className="group_card">{/* server-rendered: GroupCardServer */}</div>;
}
