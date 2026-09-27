import Link from "next/link";
import StatusPill from "@/components/StatusPill";
import { formatDateTime } from "@/lib/format";

export type SlotSummary = {
  id: string;
  title: string;
  techStack: string;
  dateTime: string;
  durationMins: number;
  status: string;
  host: { id: string; name: string } | null;
};

export default function SlotCard({ slot }: { slot: SlotSummary }) {
  return (
    <Link
      href={`/slots/${slot.id}`}
      className="group flex items-center justify-between gap-4 rounded-lg border border-line bg-paper-raised px-5 py-4 transition hover:border-teal"
    >
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded border border-line bg-paper px-2 py-0.5 text-xs font-medium text-text-muted">
            {slot.techStack}
          </span>
          <StatusPill status={slot.status} />
        </div>
        <h3 className="truncate font-display text-base font-semibold text-ink group-hover:text-teal-deep">
          {slot.title}
        </h3>
        <p className="mt-0.5 text-sm text-text-muted">
          Hosted by {slot.host?.name ?? "a peer"} · {formatDateTime(slot.dateTime)} · {slot.durationMins} min
        </p>
      </div>
      <span
        className="shrink-0 rounded-full border border-teal/40 px-3 py-1 text-xs font-medium text-teal-deep opacity-0 transition group-hover:opacity-100"
        aria-hidden="true"
      >
        View slot
      </span>
    </Link>
  );
}
