// example.server.tsx
// Server component - runs on server, returns markup only.

import type { ReactNode } from "react";
import { getExampleData } from "./example.services";

interface ExampleServerProps {
  children?: ReactNode;
}

export default async function ExampleServer(_props: ExampleServerProps) {
  const data = await getExampleData();
  return (
    <section>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}
