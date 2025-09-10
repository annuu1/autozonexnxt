// src/hooks/useAuthGuard.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  subscription?: { plan: string; status: string };
};

export default function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/v1/auth/me", { cache: "no-store" });
        if (res.status === 401) {
          // Not logged in; redirect to home (or /login if you add one)
          router.replace("/?from=/v1/dashboard");
          return;
        }
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data = await res.json();
        if (mounted) setUser(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load session");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  return { user, loading, error } as const;
}
