import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Slot, { TECH_STACKS } from "@/lib/models/Slot";
import { getSession } from "@/lib/auth";
import { sanitizeText, isValidTechStack, isFutureDate, rangesOverlap } from "@/lib/validators";

// GET /api/slots?techStack=React&status=open  -> browse/filter slots
export async function GET(req: NextRequest) {
  await connectDB();

  // Lazily flip any past "booked" slots to "completed" so status is accurate on read.
  await Slot.updateMany(
    { status: "booked", dateTime: { $lt: new Date() } },
    { $set: { status: "completed" } }
  );

  const { searchParams } = new URL(req.url);
  const techStack = searchParams.get("techStack");
  const statusParam = searchParams.get("status") || "open";

  const query: Record<string, unknown> = {};
  if (techStack && isValidTechStack(techStack)) query.techStack = techStack;
  if (statusParam !== "all") query.status = statusParam;

  const slots = await Slot.find(query)
    .sort({ dateTime: 1 })
    .populate("host", "name")
    .lean();

  return NextResponse.json({
    slots: slots.map((s) => ({
      id: s._id.toString(),
      title: s.title,
      description: s.description,
      techStack: s.techStack,
      dateTime: s.dateTime,
      durationMins: s.durationMins,
      status: s.status,
      host: s.host && typeof s.host === "object" ? { id: (s.host as { _id: unknown; name: string })._id?.toString?.() ?? "", name: (s.host as { name: string }).name } : null,
    })),
  });
}

// POST /api/slots -> host creates a new slot
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  try {
    const body = await req.json();
    const title = sanitizeText(body.title, 120);
    const description = sanitizeText(body.description, 1000);
    const techStack = body.techStack;
    const durationMins = Number(body.durationMins);
    const dateTime = new Date(body.dateTime);

    if (!title || title.length < 4) {
      return NextResponse.json({ error: "Give the slot a descriptive title." }, { status: 400 });
    }
    if (!isValidTechStack(techStack)) {
      return NextResponse.json(
        { error: `techStack must be one of: ${TECH_STACKS.join(", ")}` },
        { status: 400 }
      );
    }
    if (!Number.isFinite(durationMins) || durationMins < 15 || durationMins > 180) {
      return NextResponse.json({ error: "Duration must be 15–180 minutes." }, { status: 400 });
    }
    if (isNaN(dateTime.getTime()) || !isFutureDate(dateTime)) {
      return NextResponse.json(
        { error: "Pick a date/time at least 10 minutes from now." },
        { status: 400 }
      );
    }

    await connectDB();

    // Prevent a host from double-booking themselves.
    const hostSlots = await Slot.find({
      host: session.userId,
      status: { $in: ["open", "booked"] },
    }).lean();
    const clashes = hostSlots.some((s) =>
      rangesOverlap(dateTime, durationMins, s.dateTime, s.durationMins)
    );
    if (clashes) {
      return NextResponse.json(
        { error: "You already have another slot that overlaps this time." },
        { status: 409 }
      );
    }

    const slot = await Slot.create({
      host: session.userId,
      title,
      description,
      techStack,
      dateTime,
      durationMins,
      status: "open",
    });

    return NextResponse.json({ id: slot._id.toString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create the slot. Please try again." }, { status: 500 });
  }
}
