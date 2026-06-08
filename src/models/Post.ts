import mongoose, { Schema, Model, models } from "mongoose";

export type MediaType = "image" | "video";

export interface IMedia {
  url: string;
  publicId: string;
  type: MediaType;
  width?: number;
  height?: number;
  duration?: number;
}

export interface IPost {
  _id: string;
  content: string;
  user: mongoose.Types.ObjectId | string;
  media: IMedia[];
  comments: string[];
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
    width: Number,
    height: Number,
    duration: Number,
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    media: [MediaSchema],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });

const Post: Model<IPost> = (models.Post as Model<IPost>) || mongoose.model<IPost>("Post", PostSchema);
export default Post;
