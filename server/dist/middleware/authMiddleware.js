"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.checkAccountStatus = exports.attachUser = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const accessTokenSecret = process.env.JWT_SECRET || "change-this-secret";
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Missing or invalid authorization header" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, accessTokenSecret);
        res.locals.tokenPayload = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
};
exports.verifyToken = verifyToken;
const attachUser = async (req, res, next) => {
    const payload = res.locals.tokenPayload;
    if (!payload?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await user_1.default.findById(payload.sub);
    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
};
exports.attachUser = attachUser;
const checkAccountStatus = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.accountStatus !== "active") {
        return res.status(403).json({
            message: req.user.accountStatus === "suspended"
                ? "Account suspended"
                : "Account deleted",
        });
    }
    next();
};
exports.checkAccountStatus = checkAccountStatus;
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.user.accountType !== requiredRole) {
            return res.status(403).json({ message: "Insufficient role" });
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=authMiddleware.js.map