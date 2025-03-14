import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  source: { type: String, enum: ["email", "message"], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Event", EventSchema);
