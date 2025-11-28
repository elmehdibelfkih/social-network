"use client";
// example.client.tsx
// Client component - may use hooks, event handlers, browser APIs.

import React, { useEffect, useState } from "react";
import type { ExampleType } from "./types";

export default function ExampleClient() {
  const [state, setState] = useState<ExampleType | null>(null);

  useEffect(() => {
    // client-side initialization
  }, []);

  return (
    <div>
      <button onClick={() => console.log("clicked")}>Action</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
