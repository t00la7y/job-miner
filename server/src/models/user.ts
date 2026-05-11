import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username: string;
  email: string;
  name: string;
  surname: string;
  subscriptionType: string;
  location: string;
  profilePicture: string;
  password: string;
  accountCreationDate: Date;
  accountStatus: "active" | "suspended" | "deleted";
  accountType: "freelancer" | "recruiter" | "admin";
  accountTier: "guest" | "basic" | "premium";         // freelancers only
  recruiterTier: "tier1" | "tier2" | null;             // recruiters only
  subscription: {
    status: "active" | "cancelled" | "past_due" | "none";
    stripeCustomerId?: string;
    paypalSubscriptionId?: string;
    currentPeriodEnd?: Date;
  };
  lastLogin: Date;
  preferences: {
    jobTypes: string[];
    industries: string[];
    experienceLevel: string;
    workModes: string[];
    skills: string[];         // freelancer: populated from signup contextField
    companyName: string;      // recruiter: populated from signup contextField
  };
  savedJobs: string[];
  clickedJobs: string[];
  searchHistory: string[];
  userPrompts: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    name: { type: String, default: "" },
    surname: { type: String, default: "" },
    subscriptionType: { type: String, default: "free" },
    location: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    accountCreationDate: { type: Date, default: Date.now },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
    accountType: {
      type: String,
      enum: ["freelancer", "recruiter", "admin"],
      default: "freelancer",
    },
    accountTier: {
      type: String,
      enum: ["guest", "basic", "premium"],
      default: "guest",
    },
    recruiterTier: {
      type: String,
      enum: ["tier1", "tier2", null],
      default: null,
    },
    subscription: {
      status: {
        type: String,
        enum: ["active", "cancelled", "past_due", "none"],
        default: "none",
      },
      stripeCustomerId: { type: String, default: "" },
      paypalSubscriptionId: { type: String, default: "" },
      currentPeriodEnd: { type: Date, default: null },
    },
    lastLogin: { type: Date, default: Date.now },
    preferences: {
      jobTypes:        { type: [String], default: [] },
      industries:      { type: [String], default: [] },
      experienceLevel: { type: String,   default: "entry-level" },
      workModes:       { type: [String], default: [] },
      skills:          { type: [String], default: [] },
      companyName:     { type: String,   default: "" },
    },
    savedJobs: { type: [String], default: [] },
    clickedJobs: { type: [String], default: [] },
    searchHistory: {
      type: [String],
      default: [],
      validate: {
        validator: (items: string[]) => items.length <= 100,
        message: "searchHistory cannot exceed 100 items",
      },
    },
    userPrompts: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const transformed = ret as any;
    delete transformed.password;
    delete transformed.__v;
    return transformed;
  },
});

export default mongoose.model<IUser>("User", UserSchema);