import mongoose, { Schema, Model, models } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  password?: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  friendships: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    friendships: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const User: Model<IUser> = (models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
export default User;
