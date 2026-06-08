import mongoose, { Schema, Model, models } from "mongoose";

export interface IMessage {
  _id: string;
  chatroomId: string;
  message: string;
  from: mongoose.Types.ObjectId | string;
  to: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatroomId: { type: String, required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Message: Model<IMessage> =
  (models.Message as Model<IMessage>) || mongoose.model<IMessage>("Message", MessageSchema);
export default Message;
