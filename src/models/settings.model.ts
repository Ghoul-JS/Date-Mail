import mongoose from "mongoose";

const SyncSettingsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    outlookAccessToken: { type: String },
    outlookRefreshToken: { type: String },
    lastSync: { type: Date, default: null }
  });
  
  export default mongoose.model("SyncSettings", SyncSettingsSchema);
  