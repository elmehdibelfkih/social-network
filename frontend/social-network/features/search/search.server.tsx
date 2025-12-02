// search.server.tsx
// Minimal server component (no "use client")

import type { ReactNode } from "react";

interface SearchServerProps {
  children?: ReactNode;
}

export default function SearchServer(_props: SearchServerProps) {
  return <div className="search">{/* server-rendered: SearchServer */}</div>;
}
