export function formatDateTime(value: string | Date) {
  const d = new Date(value);
  return d.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isPast(value: string | Date) {
  return new Date(value).getTime() < Date.now();
}
