import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Slot from "@/lib/models/Slot";
import { getSession } from "@/lib/auth";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

// PATCH /api/bookings/:id { action: "cancel" } -> host or candidate cancels
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.action !== "cancel") {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  await connectDB();
  const booking = await Booking.findById(id).populate("slot");
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const isParty =
    booking.host.toString() === session.userId || booking.candidate.toString() === session.userId;
  if (!isParty) {
    return NextResponse.json({ error: "You're not part of this booking." }, { status: 403 });
  }
  if (booking.status !== "upcoming") {
    return NextResponse.json({ error: "This booking can no longer be cancelled." }, { status: 409 });
  }

  const slot = booking.slot as unknown as { dateTime: Date } | null;
  if (slot && slot.dateTime.getTime() - Date.now() < TWO_HOURS_MS) {
    return NextResponse.json(
      { error: "Bookings can only be cancelled more than 2 hours before the session." },
      { status: 409 }
    );
  }

  booking.status = "cancelled";
  booking.cancelledBy = new mongoose.Types.ObjectId(session.userId);
  await booking.save();
  await Slot.findByIdAndUpdate(booking.slot, { $set: { status: "open", bookedBy: null } });

  return NextResponse.json({ ok: true });
}
