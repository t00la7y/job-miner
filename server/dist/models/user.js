"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
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
        enum: ["jobSeeker", "recruiter", "admin"],
        default: "jobSeeker",
    },
    lastLogin: { type: Date, default: Date.now },
    preferences: {
        jobTypes: { type: [String], default: [] },
        industries: { type: [String], default: [] },
        experienceLevel: { type: String, default: "entry-level" },
    },
    savedJobs: { type: [String], default: [] },
    clickedJobs: { type: [String], default: [] },
    searchHistory: {
        type: [String],
        default: [],
        validate: {
            validator: (items) => items.length <= 100,
            message: "searchHistory cannot exceed 100 items",
        },
    },
    userPrompts: { type: [String], default: [] },
}, {
    timestamps: true,
});
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcryptjs_1.default.genSalt(12);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
UserSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const transformed = ret;
        delete transformed.password;
        delete transformed.__v;
        return transformed;
    },
});
exports.default = mongoose_1.default.model("User", UserSchema);
//# sourceMappingURL=user.js.map