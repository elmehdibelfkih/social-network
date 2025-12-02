import React from "react";
import ErrComponent from "@/features/error/ErrorActions.server";

export default function ErrorPage({ searchParams }: { searchParams?: any }) {
  const params = React.use(searchParams);
  return <ErrComponent searchParams={params} />;
}
