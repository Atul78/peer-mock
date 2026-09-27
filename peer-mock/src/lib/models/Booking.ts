import { Schema, models, model, Types } from "mongoose";

export type BookingStatus = "upcoming" | "completed" | "cancelled";

export interface IBooking {
  _id: string;
  slot: Types.ObjectId;
  host: Types.ObjectId;
  candidate: Types.ObjectId;
  status: BookingStatus;
  cancelledBy?: Types.ObjectId | null;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  slot: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
  host: { type: Schema.Types.ObjectId, ref: "User", required: true },
  candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["upcoming", "completed", "cancelled"],
    default: "upcoming",
  },
  cancelledBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now },
});

export default models.Booking || model<IBooking>("Booking", BookingSchema);
