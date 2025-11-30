// creatGroup.server.tsx
// Minimal server component (no "use client")

import type { ReactNode } from "react";

interface CreatGroupServerProps {
  children?: ReactNode;
}

export default function CreatGroupServer(_props: CreatGroupServerProps) {
  return <div className="creatGroup">{/* server-rendered: CreatGroupServer */}</div>;
}
