"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page redirects to the Tina CMS admin interface
// Tina builds its own admin UI at /admin/index.html during build
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Tina's built admin page
    // In development, Tina runs alongside Next.js dev server
    // In production, the admin UI is built by tinacms build
    if (typeof window !== "undefined") {
      // Check if we're in development mode
      const isDev = process.env.NODE_ENV === "development";
      if (isDev) {
        // In dev, Tina runs on a different port
        window.location.href = "http://localhost:3002/admin/index.html";
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Tina CMS Admin</h1>
        <p className="text-white/70">
          Loading admin interface...
        </p>
        <p className="text-white/50 text-sm mt-4">
          If you are not redirected, run <code className="bg-white/10 px-2 py-1 rounded">npm run dev:tina</code>
        </p>
      </div>
    </div>
  );
}
