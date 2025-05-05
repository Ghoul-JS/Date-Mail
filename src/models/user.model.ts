import mongoose, { Document, Schema } from "mongoose";

export interface GoogleAuth {
  accessToken?: string;
  refreshToken?: string | null;
  tokenExpiryDate?: Date | null;
}

export interface IUser {
  _id: mongoose.Types.ObjectId; 
  name: string;
  email: string;
  image: string;
  password: string;
  google?: GoogleAuth;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() {
    // Solo requerir password si no es usuario de Google
    return !this.google;
  }},
  image: { type: String, required: true },
  google: {
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiryDate: { type: Date }
  }
});

export default mongoose.model("User", UserSchema);
