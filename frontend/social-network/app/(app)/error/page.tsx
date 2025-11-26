import React from "react";
import ErrComponent from "@/components/ui/error/ErrorActions.server";

export default function ErrorPage({ searchParams }: { searchParams?: any }) {
  const params = React.use(searchParams); // unwraps Promise in server components
  return <ErrComponent searchParams={params} />;
}
