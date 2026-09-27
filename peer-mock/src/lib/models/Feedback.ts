import { Schema, models, model, Types } from "mongoose";

export interface IFeedback {
  _id: string;
  booking: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  communication: number;
  technical: number;
  problemSolving: number;
  comments: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },
  communication: { type: Number, min: 1, max: 5, required: true },
  technical: { type: Number, min: 1, max: 5, required: true },
  problemSolving: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String, default: "", maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
});

export default models.Feedback || model<IFeedback>("Feedback", FeedbackSchema);
