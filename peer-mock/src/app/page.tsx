import Link from "next/link";
import { TECH_STACKS } from "@/lib/constants";

export default function HomePage() {
  return (
    <div>
      <section className="slot-grid-bg bg-ink text-paper">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:py-20 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              Practice interviews with people actually preparing for one too.
            </h1>
            <p className="mt-4 max-w-md text-paper/75">
              Host a slot when you&apos;re free to interview someone, or book a peer&apos;s
              slot when you want to be the candidate. Real feedback, real time pressure,
              zero recruiters watching.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/slots"
                className="rounded-md bg-teal px-5 py-2.5 font-medium text-white hover:bg-teal-deep"
              >
                Browse open slots
              </Link>
              <Link
                href="/slots/new"
                className="rounded-md border border-paper/30 px-5 py-2.5 font-medium text-paper hover:bg-paper/10"
              >
                Host a slot
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-paper/15 bg-ink-soft/60 p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-paper/50">
              Today&apos;s open slots (example)
            </p>
            <div className="space-y-3">
              {[
                { t: "React hooks + performance", tag: "React", time: "7:30 PM · 45 min" },
                { t: "Two-pointer & sliding window", tag: "DSA", time: "8:15 PM · 60 min" },
                { t: "Design a URL shortener", tag: "System Design", time: "9:00 PM · 45 min" },
              ].map((s) => (
                <div
                  key={s.t}
                  className="flex items-center justify-between rounded-lg bg-paper/5 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-paper">{s.t}</p>
                    <p className="text-paper/50">{s.time}</p>
                  </div>
                  <span className="rounded-full border border-teal/40 bg-teal/10 px-2.5 py-1 text-xs text-teal-300">
                    {s.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="font-display text-2xl font-semibold text-ink">How a slot works</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Open or book a slot",
              body: "Host a time you're free to interview someone, or book a peer's open slot as the candidate.",
            },
            {
              step: "2",
              title: "Run the session",
              body: "Meet however suits you both — video call, voice, or in person — for the topic and duration listed.",
            },
            {
              step: "3",
              title: "Leave feedback",
              body: "The interviewer rates communication, technical depth, and problem-solving, with written notes.",
            },
          ].map((s) => (
            <div key={s.step} className="rounded-lg border border-line bg-paper-raised p-5">
              <span className="font-display text-sm text-teal-deep">{s.step}</span>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm text-text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <h2 className="font-display text-2xl font-semibold text-ink">Practice tracks</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {TECH_STACKS.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line bg-paper-raised px-3 py-1.5 text-sm text-text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
