// creatPost.server.tsx
// Minimal server component (no "use client")

import type { ReactNode } from "react";

interface CreatPostServerProps {
  children?: ReactNode;
}

export default function CreatPostServer(_props: CreatPostServerProps) {
  return <div className="creatPost">{/* server-rendered: CreatPostServer */}</div>;
}
