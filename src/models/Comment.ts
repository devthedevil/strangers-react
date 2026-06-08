import mongoose, { Schema, Model, models } from "mongoose";

export interface IComment {
  _id: string;
  content: string;
  user: mongoose.Types.ObjectId | string;
  post: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

const Comment: Model<IComment> =
  (models.Comment as Model<IComment>) || mongoose.model<IComment>("Comment", CommentSchema);
export default Comment;
