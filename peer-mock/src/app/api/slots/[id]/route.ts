import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Slot from "@/lib/models/Slot";
import Booking from "@/lib/models/Booking";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  }

  await connectDB();
  const slot = await Slot.findById(id).populate("host", "name email").lean();
  if (!slot) return NextResponse.json({ error: "Slot not found." }, { status: 404 });

  const host = slot.host as unknown as { _id: unknown; name: string; email: string } | null;

  return NextResponse.json({
    slot: {
      id: slot._id.toString(),
      title: slot.title,
      description: slot.description,
      techStack: slot.techStack,
      dateTime: slot.dateTime,
      durationMins: slot.durationMins,
      status: slot.status,
      host: host ? { id: host._id?.toString?.() ?? "", name: host.name } : null,
    },
  });
}

// Host cancels their own still-open slot.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  }

  await connectDB();
  const slot = await Slot.findById(id);
  if (!slot) return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  if (slot.host.toString() !== session.userId) {
    return NextResponse.json({ error: "You can only cancel your own slots." }, { status: 403 });
  }
  if (slot.status === "booked") {
    return NextResponse.json(
      { error: "This slot is already booked — cancel the booking instead." },
      { status: 409 }
    );
  }

  slot.status = "cancelled";
  await slot.save();
  await Booking.updateMany({ slot: slot._id }, { $set: { status: "cancelled" } });

  return NextResponse.json({ ok: true });
}
