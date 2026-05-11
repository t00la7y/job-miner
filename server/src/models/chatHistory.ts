import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChatHistory extends Document {
  user: Types.ObjectId;
  sessionId: number;
  userMessage: string;
  botResponse: string;
  timestamp: Date;
}

const ChatHistorySchema: Schema<IChatHistory> = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  sessionId: { type: Number, required: true, default: 0 },
  userMessage: { type: String, required: true },
  botResponse: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
