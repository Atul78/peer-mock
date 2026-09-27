import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Slot from "@/lib/models/Slot";
import Booking from "@/lib/models/Booking";
import Feedback from "@/lib/models/Feedback";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

  await connectDB();

  await Slot.updateMany(
    { status: "booked", dateTime: { $lt: new Date() } },
    { $set: { status: "completed" } }
  );

  const [hostedSlots, myBookings, feedbackReceived] = await Promise.all([
    Slot.find({ host: session.userId }).sort({ dateTime: -1 }).lean(),
    Booking.find({ candidate: session.userId })
      .sort({ createdAt: -1 })
      .populate("slot")
      .populate("host", "name")
      .lean(),
    Feedback.find({ to: session.userId }).sort({ createdAt: -1 }).lean(),
  ]);

  // Bookings I hosted that have ended and still need my feedback.
  const hostedBookings = await Booking.find({ host: session.userId, status: "upcoming" })
    .populate("slot")
    .populate("candidate", "name")
    .lean();
  const pendingFeedback = hostedBookings.filter((b) => {
    const slot = b.slot as unknown as { dateTime: Date; durationMins: number } | null;
    return slot && slot.dateTime.getTime() + slot.durationMins * 60000 < Date.now();
  });

  const ratingsAvg = (arr: typeof feedbackReceived) => {
    if (arr.length === 0) return null;
    const total = arr.reduce((sum, f) => sum + f.communication + f.technical + f.problemSolving, 0);
    return Math.round((total / (arr.length * 3)) * 10) / 10;
  };

  return NextResponse.json({
    hostedSlots: hostedSlots.map((s) => ({
      id: s._id.toString(),
      title: s.title,
      techStack: s.techStack,
      dateTime: s.dateTime,
      durationMins: s.durationMins,
      status: s.status,
    })),
    myBookings: myBookings.map((b) => {
      const slot = b.slot as unknown as {
        _id: unknown;
        title: string;
        techStack: string;
        dateTime: Date;
        durationMins: number;
      } | null;
      const host = b.host as unknown as { name: string } | null;
      return {
        id: b._id.toString(),
        status: b.status,
        slot: slot
          ? {
              id: slot._id?.toString?.() ?? "",
              title: slot.title,
              techStack: slot.techStack,
              dateTime: slot.dateTime,
              durationMins: slot.durationMins,
            }
          : null,
        hostName: host?.name ?? "Unknown",
      };
    }),
    pendingFeedback: pendingFeedback.map((b) => {
      const slot = b.slot as unknown as { title: string; techStack: string; dateTime: Date } | null;
      const candidate = b.candidate as unknown as { name: string } | null;
      return {
        bookingId: b._id.toString(),
        slotTitle: slot?.title ?? "",
        techStack: slot?.techStack ?? "",
        dateTime: slot?.dateTime ?? null,
        candidateName: candidate?.name ?? "Candidate",
      };
    }),
    feedbackReceived: feedbackReceived.map((f) => ({
      id: f._id.toString(),
      communication: f.communication,
      technical: f.technical,
      problemSolving: f.problemSolving,
      comments: f.comments,
      createdAt: f.createdAt,
    })),
    averageRating: ratingsAvg(feedbackReceived),
  });
}
