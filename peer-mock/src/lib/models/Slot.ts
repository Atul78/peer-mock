import { Schema, models, model, Types } from "mongoose";
import { TECH_STACKS } from "@/lib/constants";

export { TECH_STACKS };

export type SlotStatus = "open" | "booked" | "completed" | "cancelled";

export interface ISlot {
  _id: string;
  host: Types.ObjectId;
  title: string;
  description: string;
  techStack: string;
  dateTime: Date;
  durationMins: number;
  status: SlotStatus;
  bookedBy?: Types.ObjectId | null;
  createdAt: Date;
}

const SlotSchema = new Schema<ISlot>({
  host: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: "", maxlength: 1000 },
  techStack: { type: String, required: true, enum: TECH_STACKS },
  dateTime: { type: Date, required: true },
  durationMins: { type: Number, required: true, min: 15, max: 180, default: 45 },
  status: {
    type: String,
    enum: ["open", "booked", "completed", "cancelled"],
    default: "open",
  },
  bookedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now },
});

SlotSchema.index({ techStack: 1, dateTime: 1 });

export default models.Slot || model<ISlot>("Slot", SlotSchema);
