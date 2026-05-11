"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_1 = __importDefault(require("../models/user"));
const refreshToken_1 = __importDefault(require("../models/refreshToken"));
const accessTokenSecret = process.env.JWT_SECRET || "change-this-secret";
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || accessTokenSecret;
const accessTokenExpiry = process.env.JWT_ACCESS_EXPIRATION || "15m";
const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRATION || "7d";
const buildUserPayload = (user) => ({
    id: user._id.toString(),
    username: user.username,
    role: user.accountType,
    status: user.accountStatus,
});
const createAccessToken = (userId, role, status) => jsonwebtoken_1.default.sign({ sub: userId, role, status }, accessTokenSecret, { expiresIn: accessTokenExpiry });
const createRefreshToken = (userId, tokenId) => jsonwebtoken_1.default.sign({ sub: userId, tid: tokenId }, refreshTokenSecret, { expiresIn: refreshTokenExpiry });
const sendRefreshCookie = (res, token) => {
    const secure = process.env.NODE_ENV === "production";
    const maxAge = 1000 * 60 * 60 * 24 * 7; // 7 days
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure,
        sameSite: "strict",
        maxAge,
        path: "/api/auth",
    });
};
const register = async (req, res) => {
    try {
        const { username, email, password, name, surname, location } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "username, email and password are required",
            });
        }
        const existing = await user_1.default.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() },
            ],
        });
        if (existing) {
            return res
                .status(400)
                .json({ message: "Email or username already in use" });
        }
        const user = await user_1.default.create({
            username,
            email,
            password,
            name,
            surname,
            location,
        });
        const tokenId = crypto_1.default.randomUUID();
        const refreshToken = createRefreshToken(user._id.toString(), tokenId);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await refreshToken_1.default.create({
            user: user._id,
            tokenId,
            expiresAt,
            userAgent: req.get("User-Agent") || "",
        });
        sendRefreshCookie(res, refreshToken);
        const accessToken = createAccessToken(user._id.toString(), user.accountType, user.accountStatus);
        res.status(201).json({
            user: buildUserPayload(user),
            accessToken,
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            message: "Failed to register user",
            ...(process.env.NODE_ENV === "development" && { error: error.message }),
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res
                .status(400)
                .json({ message: "identifier and password are required" });
        }
        const user = await user_1.default.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() },
            ],
        }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        user.lastLogin = new Date();
        await user.save();
        const tokenId = crypto_1.default.randomUUID();
        const refreshToken = createRefreshToken(user._id.toString(), tokenId);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await refreshToken_1.default.create({
            user: user._id,
            tokenId,
            expiresAt,
            userAgent: req.get("User-Agent") || "",
        });
        sendRefreshCookie(res, refreshToken);
        const accessToken = createAccessToken(user._id.toString(), user.accountType, user.accountStatus);
        res.json({
            user: buildUserPayload(user),
            accessToken,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Failed to log in",
            ...(process.env.NODE_ENV === "development" && { error: error.message }),
        });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ message: "Refresh token missing" });
        }
        const payload = jsonwebtoken_1.default.verify(token, refreshTokenSecret);
        const existingToken = await refreshToken_1.default.findOne({ tokenId: payload.tid });
        if (!existingToken) {
            return res
                .status(401)
                .json({ message: "Refresh token invalid or rotated" });
        }
        await existingToken.deleteOne();
        const tokenId = crypto_1.default.randomUUID();
        const refreshToken = createRefreshToken(payload.sub, tokenId);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await refreshToken_1.default.create({
            user: existingToken.user,
            tokenId,
            expiresAt,
            userAgent: req.get("User-Agent") || "",
        });
        sendRefreshCookie(res, refreshToken);
        const user = await user_1.default.findById(payload.sub);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        const accessToken = createAccessToken(user._id.toString(), user.accountType, user.accountStatus);
        res.json({ accessToken });
    }
    catch (error) {
        console.error("Refresh error:", error.message);
        return res.status(401).json({ message: "Could not refresh token" });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            try {
                const payload = jsonwebtoken_1.default.verify(token, refreshTokenSecret);
                await refreshToken_1.default.deleteOne({ tokenId: payload.tid });
            }
            catch {
                // swallow invalid token cleanup and still clear cookie
            }
        }
        res.clearCookie("refreshToken", { path: "/api/auth" });
        res.status(204).end();
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Logout failed" });
    }
};
exports.logout = logout;
const getProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    return res.json({
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            name: req.user.name,
            surname: req.user.surname,
            subscriptionType: req.user.subscriptionType,
            location: req.user.location,
            profilePicture: req.user.profilePicture,
            accountStatus: req.user.accountStatus,
            accountType: req.user.accountType,
            lastLogin: req.user.lastLogin,
            preferences: req.user.preferences,
            savedJobs: req.user.savedJobs,
            clickedJobs: req.user.clickedJobs,
            searchHistory: req.user.searchHistory,
            userPrompts: req.user.userPrompts,
        },
    });
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map