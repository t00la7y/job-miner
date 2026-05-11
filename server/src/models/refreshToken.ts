import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  tokenId: string;
  userAgent?: string;
  expiresAt: Date;
}

const RefreshTokenSchema: Schema<IRefreshToken> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenId: { type: String, required: true, unique: true },
    userAgent: { type: String, default: "" },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
);
