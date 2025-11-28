// example.hooks.ts
// Feature-specific hooks (client or shared)

import { useState, useEffect } from "react";
import type { ExampleType } from "./types";

export function useExample() {
  const [data, setData] = useState<ExampleType | null>(null);

  useEffect(() => {
    // optionally load or subscribe to data
  }, []);

  return { data, setData };
}
