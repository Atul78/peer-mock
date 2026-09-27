import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import Feedback from "@/lib/models/Feedback";
import { getSession } from "@/lib/auth";
import { sanitizeText } from "@/lib/validators";

function clampRating(n: unknown) {
  const num = Number(n);
  if (!Number.isFinite(num)) return null;
  return Math.min(5, Math.max(1, Math.round(num)));
}

// POST /api/feedback { bookingId, communication, technical, problemSolving, comments }
// Only the slot host can leave feedback, for a booking that has taken place.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  try {
    const body = await req.json();
    const bookingId = body.bookingId;
    if (!mongoose.isValidObjectId(bookingId)) {
      return NextResponse.json({ error: "Invalid booking." }, { status: 400 });
    }

    const communication = clampRating(body.communication);
    const technical = clampRating(body.technical);
    const problemSolving = clampRating(body.problemSolving);
    const comments = sanitizeText(body.comments, 2000);

    if (!communication || !technical || !problemSolving) {
      return NextResponse.json({ error: "All three ratings (1–5) are required." }, { status: 400 });
    }

    await connectDB();
    const booking = await Booking.findById(bookingId).populate("slot");
    if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

    if (booking.host.toString() !== session.userId) {
      return NextResponse.json(
        { error: "Only the interviewer who hosted this slot can leave feedback." },
        { status: 403 }
      );
    }

    const slot = booking.slot as unknown as { dateTime: Date; durationMins: number } | null;
    const sessionEnded = slot ? slot.dateTime.getTime() + slot.durationMins * 60000 < Date.now() : false;
    if (booking.status === "cancelled" || !sessionEnded) {
      return NextResponse.json(
        { error: "Feedback can only be left after the session has taken place." },
        { status: 409 }
      );
    }

    const existing = await Feedback.findOne({ booking: booking._id });
    if (existing) {
      return NextResponse.json({ error: "Feedback for this session was already submitted." }, { status: 409 });
    }

    const feedback = await Feedback.create({
      booking: booking._id,
      from: session.userId,
      to: booking.candidate,
      communication,
      technical,
      problemSolving,
      comments,
    });

    booking.status = "completed";
    await booking.save();

    return NextResponse.json({ id: feedback._id.toString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not submit feedback. Please try again." }, { status: 500 });
  }
}
