"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Me = { id: string; name: string; email: string } | null;

export default function Navbar() {
  const [me, setMe] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .finally(() => setLoaded(true));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-paper-raised">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink">
          PeerMock
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/slots" className="text-text-muted hover:text-ink">
            Browse slots
          </Link>
          {loaded && me && (
            <>
              <Link href="/slots/new" className="text-text-muted hover:text-ink">
                Host a slot
              </Link>
              <Link href="/dashboard" className="text-text-muted hover:text-ink">
                Dashboard
              </Link>
              <span className="hidden text-text-muted sm:inline">Hi, {me.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="rounded-md border border-line px-3 py-1.5 text-text hover:bg-paper"
              >
                Log out
              </button>
            </>
          )}
          {loaded && !me && (
            <>
              <Link href="/login" className="text-text-muted hover:text-ink">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-teal px-3 py-1.5 font-medium text-white hover:bg-teal-deep"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
