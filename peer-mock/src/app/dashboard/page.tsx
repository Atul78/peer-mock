"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusPill from "@/components/StatusPill";
import RatingStars from "@/components/RatingStars";
import { formatDateTime } from "@/lib/format";

type HostedSlot = {
  id: string;
  title: string;
  techStack: string;
  dateTime: string;
  durationMins: number;
  status: string;
};

type MyBooking = {
  id: string;
  status: string;
  hostName: string;
  slot: { id: string; title: string; techStack: string; dateTime: string; durationMins: number } | null;
};

type PendingFeedback = {
  bookingId: string;
  slotTitle: string;
  techStack: string;
  dateTime: string | null;
  candidateName: string;
};

type FeedbackReceived = {
  id: string;
  communication: number;
  technical: number;
  problemSolving: number;
  comments: string;
  createdAt: string;
};

type DashboardData = {
  hostedSlots: HostedSlot[];
  myBookings: MyBooking[];
  pendingFeedback: PendingFeedback[];
  feedbackReceived: FeedbackReceived[];
  averageRating: number | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    if (res.status === 401) {
      router.push("/login?next=/dashboard");
      return;
    }
    const d = await res.json();
    setData(d);
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount pattern
    load();
  }, [load]);

  async function cancelBooking(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Could not cancel.");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function cancelSlot(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/slots/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Could not cancel.");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (!data) return <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-text-muted">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Your dashboard</h1>
        {data.averageRating !== null && (
          <div className="text-right">
            <p className="text-xs text-text-muted">Average rating as candidate</p>
            <RatingStars value={Math.round(data.averageRating)} />
          </div>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {data.pendingFeedback.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-lg font-semibold text-ink">Feedback you owe</h2>
          <p className="mt-1 text-sm text-text-muted">
            These sessions have finished — leave feedback for your candidate.
          </p>
          <div className="mt-3 space-y-2">
            {data.pendingFeedback.map((p) => (
              <div
                key={p.bookingId}
                className="flex items-center justify-between rounded-lg border border-gold/40 bg-gold/10 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{p.slotTitle}</p>
                  <p className="text-xs text-text-muted">
                    With {p.candidateName} · {p.dateTime ? formatDateTime(p.dateTime) : ""}
                  </p>
                </div>
                <Link
                  href={`/bookings/${p.bookingId}/feedback`}
                  className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-soft"
                >
                  Leave feedback
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold text-ink">Slots you&apos;re hosting</h2>
        {data.hostedSlots.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">
            You haven&apos;t hosted a slot yet.{" "}
            <Link href="/slots/new" className="text-teal-deep underline">
              Host one
            </Link>
            .
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {data.hostedSlots.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-line bg-paper-raised px-4 py-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded border border-line bg-paper px-2 py-0.5 text-xs text-text-muted">
                      {s.techStack}
                    </span>
                    <StatusPill status={s.status} />
                  </div>
                  <Link href={`/slots/${s.id}`} className="text-sm font-medium text-ink hover:text-teal-deep">
                    {s.title}
                  </Link>
                  <p className="text-xs text-text-muted">{formatDateTime(s.dateTime)} · {s.durationMins} min</p>
                </div>
                {s.status === "open" && (
                  <button
                    onClick={() => cancelSlot(s.id)}
                    disabled={busyId === s.id}
                    className="shrink-0 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold text-ink">Slots you&apos;ve booked</h2>
        {data.myBookings.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">
            You haven&apos;t booked a slot yet.{" "}
            <Link href="/slots" className="text-teal-deep underline">
              Browse open slots
            </Link>
            .
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {data.myBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-line bg-paper-raised px-4 py-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    {b.slot && (
                      <span className="rounded border border-line bg-paper px-2 py-0.5 text-xs text-text-muted">
                        {b.slot.techStack}
                      </span>
                    )}
                    <StatusPill status={b.status} />
                  </div>
                  <p className="text-sm font-medium text-ink">{b.slot?.title ?? "Slot removed"}</p>
                  <p className="text-xs text-text-muted">
                    With {b.hostName} · {b.slot ? formatDateTime(b.slot.dateTime) : ""}
                  </p>
                </div>
                {b.status === "upcoming" && (
                  <button
                    onClick={() => cancelBooking(b.id)}
                    disabled={busyId === b.id}
                    className="shrink-0 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {data.feedbackReceived.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">Feedback you&apos;ve received</h2>
          <div className="mt-3 space-y-3">
            {data.feedbackReceived.map((f) => (
              <div key={f.id} className="rounded-lg border border-line bg-paper-raised p-4">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                  <span>Communication <RatingStars value={f.communication} /></span>
                  <span>Technical <RatingStars value={f.technical} /></span>
                  <span>Problem-solving <RatingStars value={f.problemSolving} /></span>
                </div>
                {f.comments && <p className="mt-2 text-sm text-text">{f.comments}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
