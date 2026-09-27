import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Slot from "@/lib/models/Slot";
import Booking from "@/lib/models/Booking";
import { getSession } from "@/lib/auth";
import { rangesOverlap } from "@/lib/validators";

// POST /api/bookings { slotId } -> candidate books an open slot
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  try {
    const body = await req.json();
    const slotId = body.slotId;
    if (!mongoose.isValidObjectId(slotId)) {
      return NextResponse.json({ error: "Invalid slot." }, { status: 400 });
    }

    await connectDB();
    const slot = await Slot.findById(slotId);
    if (!slot) return NextResponse.json({ error: "Slot not found." }, { status: 404 });

    if (slot.host.toString() === session.userId) {
      return NextResponse.json({ error: "You can't book your own slot." }, { status: 400 });
    }
    if (slot.status !== "open") {
      return NextResponse.json({ error: "This slot is no longer available." }, { status: 409 });
    }

    // Prevent the candidate from double-booking an overlapping slot.
    const myBookings = await Booking.find({ candidate: session.userId, status: "upcoming" }).populate(
      "slot",
      "dateTime durationMins"
    );
    const clashes = myBookings.some((b) => {
      const s = b.slot as unknown as { dateTime: Date; durationMins: number } | null;
      return s && rangesOverlap(slot.dateTime, slot.durationMins, s.dateTime, s.durationMins);
    });
    if (clashes) {
      return NextResponse.json(
        { error: "You already have another booking that overlaps this time." },
        { status: 409 }
      );
    }

    // Atomic guard against a race where two candidates book the same slot at once.
    const updated = await Slot.findOneAndUpdate(
      { _id: slot._id, status: "open" },
      { $set: { status: "booked", bookedBy: session.userId } },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: "This slot was just booked by someone else." }, { status: 409 });
    }

    const booking = await Booking.create({
      slot: slot._id,
      host: slot.host,
      candidate: session.userId,
      status: "upcoming",
    });

    return NextResponse.json({ id: booking._id.toString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create the booking. Please try again." }, { status: 500 });
  }
}
