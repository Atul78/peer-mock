"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TECH_STACKS } from "@/lib/constants";

function defaultDateTime() {
  const d = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export default function NewSlotPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState<string>(TECH_STACKS[0]);
  const [dateTime, setDateTime] = useState(defaultDateTime());
  const [durationMins, setDurationMins] = useState(45);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) router.push("/login?next=/slots/new");
        else setChecking(false);
      });
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          techStack,
          dateTime: new Date(dateTime).toISOString(),
          durationMins,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/slots/${data.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-ink">Host a mock interview slot</h1>
      <p className="mt-1 text-sm text-text-muted">
        Pick a time you&apos;re free to interview someone. Anyone can book it until then.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={4}
            placeholder="e.g. Array & string DSA round"
            className="w-full rounded-md border border-line bg-paper-raised px-3 py-2 text-sm focus:border-teal focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">What to expect (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Format, difficulty, what the candidate should bring…"
            className="w-full rounded-md border border-line bg-paper-raised px-3 py-2 text-sm focus:border-teal focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Topic</label>
            <select
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="w-full rounded-md border border-line bg-paper-raised px-3 py-2 text-sm focus:border-teal focus:outline-none"
            >
              {TECH_STACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Duration (min)</label>
            <input
              type="number"
              min={15}
              max={180}
              step={15}
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full rounded-md border border-line bg-paper-raised px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Date & time</label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            className="w-full rounded-md border border-line bg-paper-raised px-3 py-2 text-sm focus:border-teal focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-teal px-4 py-2.5 font-medium text-white hover:bg-teal-deep disabled:opacity-60"
        >
          {loading ? "Publishing…" : "Publish slot"}
        </button>
      </form>
    </div>
  );
}
