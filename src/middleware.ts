import { updateSession } from "@/lib/middleware";

// In a Vite/browser build the Next.js `NextRequest` type and middleware
// runtime are not available. Export a thin adapter that calls the
// lib middleware placeholder. This keeps the file present for any
// environments that expect it while avoiding Next.js runtime types.
export async function middleware(request: unknown) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
