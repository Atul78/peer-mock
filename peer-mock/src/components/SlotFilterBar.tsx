"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TECH_STACKS } from "@/lib/constants";

export default function SlotFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("techStack") ?? "";

  function setFilter(t: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (t) params.set("techStack", t);
    else params.delete("techStack");
    router.push(`/slots?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => setFilter("")}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
          active === "" ? "border-teal bg-teal/10 text-teal-deep" : "border-line text-text-muted hover:border-teal"
        }`}
      >
        All
      </button>
      {TECH_STACKS.map((t) => (
        <button
          key={t}
          onClick={() => setFilter(t)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            active === t ? "border-teal bg-teal/10 text-teal-deep" : "border-line text-text-muted hover:border-teal"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
