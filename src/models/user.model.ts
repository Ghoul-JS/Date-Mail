import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  outlookId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);