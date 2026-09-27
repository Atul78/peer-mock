const STYLES: Record<string, string> = {
  open: "bg-teal/10 text-teal-deep border-teal/30",
  booked: "bg-gold/15 text-[#8a5c14] border-gold/40",
  completed: "bg-ink/5 text-text-muted border-line",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  upcoming: "bg-gold/15 text-[#8a5c14] border-gold/40",
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
        STYLES[status] ?? "bg-ink/5 text-text-muted border-line"
      }`}
    >
      {status}
    </span>
  );
}
