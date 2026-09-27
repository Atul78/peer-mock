import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Slot from "@/lib/models/Slot";
import StatusPill from "@/components/StatusPill";
import SlotActions from "@/components/SlotActions";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getSlot(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const slot = await Slot.findById(id).populate("host", "name").lean();
  if (!slot) return null;
  const host = slot.host as unknown as { _id: unknown; name: string } | null;
  return {
    id: slot._id.toString(),
    title: slot.title,
    description: slot.description,
    techStack: slot.techStack,
    dateTime: slot.dateTime.toISOString(),
    durationMins: slot.durationMins,
    status: slot.status,
    host: host ? { id: host._id?.toString?.() ?? "", name: host.name } : null,
  };
}

export default async function SlotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slot = await getSlot(id);
  if (!slot) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded border border-line bg-paper-raised px-2 py-0.5 text-xs font-medium text-text-muted">
          {slot.techStack}
        </span>
        <StatusPill status={slot.status} />
      </div>

      <h1 className="font-display text-3xl font-bold text-ink">{slot.title}</h1>
      <p className="mt-2 text-text-muted">
        Hosted by {slot.host?.name ?? "a peer"} · {formatDateTime(slot.dateTime)} · {slot.durationMins} minutes
      </p>

      {slot.description && (
        <div className="mt-6 rounded-lg border border-line bg-paper-raised p-5">
          <h2 className="font-display text-sm font-semibold text-ink">What to expect</h2>
          <p className="mt-1.5 whitespace-pre-wrap text-sm text-text-muted">{slot.description}</p>
        </div>
      )}

      <div className="mt-8">
        <SlotActions slotId={slot.id} hostId={slot.host?.id ?? ""} status={slot.status} />
      </div>
    </div>
  );
}
