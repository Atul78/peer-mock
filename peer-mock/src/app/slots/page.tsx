import Link from "next/link";
import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Slot, { TECH_STACKS } from "@/lib/models/Slot";
import { isValidTechStack } from "@/lib/validators";
import SlotCard, { SlotSummary } from "@/components/SlotCard";
import SlotFilterBar from "@/components/SlotFilterBar";

export const dynamic = "force-dynamic";

async function getOpenSlots(techStack?: string) {
  await connectDB();
  await Slot.updateMany(
    { status: "booked", dateTime: { $lt: new Date() } },
    { $set: { status: "completed" } }
  );

  const query: Record<string, unknown> = { status: "open" };
  if (techStack && isValidTechStack(techStack)) query.techStack = techStack;

  const slots = await Slot.find(query).sort({ dateTime: 1 }).populate("host", "name").lean();

  return slots.map((s) => ({
    id: s._id.toString(),
    title: s.title,
    techStack: s.techStack,
    dateTime: s.dateTime.toISOString(),
    durationMins: s.durationMins,
    status: s.status,
    host:
      s.host && typeof s.host === "object"
        ? { id: (s.host as { _id: unknown })._id?.toString?.() ?? "", name: (s.host as { name: string }).name }
        : null,
  })) satisfies SlotSummary[];
}

async function SlotsList({ techStack }: { techStack?: string }) {
  const slots = await getOpenSlots(techStack);

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-paper-raised px-6 py-14 text-center">
        <p className="font-display text-lg font-semibold text-ink">No open slots right now</p>
        <p className="mt-1 text-sm text-text-muted">
          {techStack ? `Nobody has an open ${techStack} slot at the moment.` : "Be the first to host one."}
        </p>
        <Link
          href="/slots/new"
          className="mt-4 inline-block rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-deep"
        >
          Host a slot
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {slots.map((s) => (
        <SlotCard key={s.id} slot={s} />
      ))}
    </div>
  );
}

export default async function SlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ techStack?: string }>;
}) {
  const { techStack } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Open slots</h1>
          <p className="mt-1 text-sm text-text-muted">{TECH_STACKS.length} practice tracks to choose from.</p>
        </div>
        <Link
          href="/slots/new"
          className="shrink-0 rounded-md border border-teal px-4 py-2 text-sm font-medium text-teal-deep hover:bg-teal/10"
        >
          Host a slot
        </Link>
      </div>

      <Suspense>
        <SlotFilterBar />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-text-muted">Loading slots…</p>}>
          <SlotsList techStack={techStack} />
        </Suspense>
      </div>
    </div>
  );
}
