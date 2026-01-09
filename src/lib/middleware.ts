// Middleware logic from Next.js is not applicable in the Vite/browser build.
// Export a no-op placeholder to avoid TypeScript build errors in this environment.

export async function updateSession(_request: unknown) {
  // Reference the param to avoid unused-var lint errors in browser build.
  void _request;
  // Placeholder for server/runtime-specific session update.
  return null;
}
