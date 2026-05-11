import mongoose, { Schema, Document } from "mongoose";
import { IJob } from "./job";

export interface IJobCache extends Document {
  queryKey: string;
  jobs: IJob[];
  fetchedAt: Date;
  ttlHours: number;
}

const JobCacheSchema = new Schema<IJobCache>({
  queryKey: { type: String, required: true, unique: true, index: true },
  jobs: { type: [Schema.Types.Mixed], required: true },
  fetchedAt: { type: Date, default: Date.now },
  ttlHours: { type: Number, default: 6 },
});

JobCacheSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 6 * 60 * 60 });

export default mongoose.model<IJobCache>("JobCache", JobCacheSchema);
