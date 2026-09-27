"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { id: string; name: string } | null;

export default function SlotActions({
  slotId,
  hostId,
  status,
}: {
  slotId: string;
  hostId: string;
  status: string;
}) {
  const router = useRouter();
  const [me, setMe] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .finally(() => setLoaded(true));
  }, []);

  async function book() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not book this slot.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelSlot() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/slots/${slotId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not cancel this slot.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) return null;

  if (!me) {
    return (
      <a
        href={`/login?next=/slots/${slotId}`}
        className="inline-block rounded-md bg-teal px-5 py-2.5 font-medium text-white hover:bg-teal-deep"
      >
        Log in to book this slot
      </a>
    );
  }

  const isHost = me.id === hostId;

  return (
    <div>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {isHost && status === "open" && (
        <button
          onClick={cancelSlot}
          disabled={loading}
          className="rounded-md border border-red-300 px-5 py-2.5 font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {loading ? "Cancelling…" : "Cancel this slot"}
        </button>
      )}
      {isHost && status !== "open" && (
        <p className="text-sm text-text-muted">You&apos;re hosting this slot.</p>
      )}
      {!isHost && status === "open" && (
        <button
          onClick={book}
          disabled={loading}
          className="rounded-md bg-teal px-5 py-2.5 font-medium text-white hover:bg-teal-deep disabled:opacity-60"
        >
          {loading ? "Booking…" : "Book this slot"}
        </button>
      )}
      {!isHost && status !== "open" && (
        <p className="text-sm text-text-muted">This slot is no longer open for booking.</p>
      )}
    </div>
  );
}
