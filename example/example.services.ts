// example.services.ts
// Thin service layer for example (wrap APIs / libs)

export async function getExampleData(): Promise<Record<string, any>> {
  // Replace with real API client call, e.g. libs/apiClient.get(...)
  return { message: "stub data for Example" };
}
