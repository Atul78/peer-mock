import { TECH_STACKS } from "@/lib/constants";

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeText(input: unknown, maxLen = 500): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, maxLen);
}

export function isValidTechStack(value: unknown): value is (typeof TECH_STACKS)[number] {
  return typeof value === "string" && (TECH_STACKS as readonly string[]).includes(value);
}

export function isFutureDate(date: Date) {
  return date.getTime() > Date.now() + 10 * 60 * 1000; // at least 10 min from now
}

export function rangesOverlap(
  aStart: Date,
  aDurationMins: number,
  bStart: Date,
  bDurationMins: number
) {
  const aEnd = aStart.getTime() + aDurationMins * 60000;
  const bEnd = bStart.getTime() + bDurationMins * 60000;
  return aStart.getTime() < bEnd && bStart.getTime() < aEnd;
}
