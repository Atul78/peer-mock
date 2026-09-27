"use client";

import { useState, FormEvent, use } from "react";
import { useRouter } from "next/navigation";

const CRITERIA = [
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical depth" },
  { key: "problemSolving", label: "Problem-solving" },
] as const;

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [ratings, setRatings] = useState<Record<string, number>>({
    communication: 4,
    technical: 4,
    problemSolving: 4,
  });
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, ...ratings, comments }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
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

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-ink">Leave feedback</h1>
      <p className="mt-1 text-sm text-text-muted">
        Rate the candidate on each criterion (1 = needs work, 5 = excellent).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {CRITERIA.map((c) => (
          <div key={c.key}>
            <label className="mb-1 block text-sm font-medium text-ink">{c.label}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRatings((r) => ({ ...r, [c.key]: n }))}
                  className={`h-9 w-9 rounded-md border text-sm font-medium transition ${
                    ratings[c.key] >= n
                      ? "border-gold bg-gold/20 text-[#8a5c14]"
                      : "border-line text-text-muted hover:border-gold"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Written feedback</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder="What went well, what to work on…"
            className="w-full rounded-md border border-line bg-paper-raised px-3 py-2 text-sm focus:border-teal focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-teal px-4 py-2.5 font-medium text-white hover:bg-teal-deep disabled:opacity-60"
        >
          {loading ? "Submitting…" : "Submit feedback"}
        </button>
      </form>
    </div>
  );
}
