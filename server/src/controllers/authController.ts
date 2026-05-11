import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User, { IUser } from "../models/user";
import RefreshToken from "../models/refreshToken";

const accessTokenSecret  = process.env.JWT_SECRET         || "change-this-secret";
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET  || accessTokenSecret;
const accessTokenExpiry  = process.env.JWT_ACCESS_EXPIRATION  || "15m";
const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRATION || "7d";

const buildUserPayload = (user: IUser) => ({
  id:            user._id.toString(),
  username:      user.username,
  role:          user.accountType,
  tier:          user.accountType === "recruiter" ? user.recruiterTier : user.accountTier,
  status:        user.accountStatus,
});

const createAccessToken = (userId: string, role: string, status: string) =>
  jwt.sign(
    { sub: userId, role, status },
    accessTokenSecret as jwt.Secret,
    { expiresIn: accessTokenExpiry } as jwt.SignOptions,
  );

const createRefreshToken = (userId: string, tokenId: string) =>
  jwt.sign(
    { sub: userId, tid: tokenId },
    refreshTokenSecret as jwt.Secret,
    { expiresIn: refreshTokenExpiry } as jwt.SignOptions,
  );

const sendRefreshCookie = (res: Response, token: string) => {
  const secure = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    path: "/api/auth",
  });
};

// ─── Register ────────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      name,
      surname,
      location,
      accountType,  // "freelancer" | "recruiter"
      skills,       // freelancer contextField — comma-separated string
      companyName,  // recruiter contextField
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "username, email and password are required",
      });
    }

    const existing = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existing) {
      return res.status(400).json({ message: "Email or username already in use" });
    }

    // Resolve account type — default to freelancer
    const resolvedType: "freelancer" | "recruiter" =
      accountType === "recruiter" ? "recruiter" : "freelancer";

    // Build preferences from signup contextField
    const preferences: Record<string, any> = {
      jobTypes:        [],
      industries:      [],
      experienceLevel: "entry-level",
      workModes:       [],
      skills:          resolvedType === "freelancer" && skills
                         ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                         : [],
      companyName:     resolvedType === "recruiter" ? (companyName ?? "") : "",
    };

    const user = await User.create({
      username,
      email,
      password,
      name:        name        ?? "",
      surname:     surname     ?? "",
      location:    location    ?? "",
      accountType: resolvedType,
      accountTier: "guest",                                        // all new users start as guest
      recruiterTier: resolvedType === "recruiter" ? "tier1" : null, // recruiters default to tier1
      subscription: { status: "none" },
      preferences,
    });

    const tokenId     = crypto.randomUUID();
    const refreshToken = createRefreshToken(user._id.toString(), tokenId);
    const expiresAt   = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      user:      user._id,
      tokenId,
      expiresAt,
      userAgent: req.get("User-Agent") || "",
    });

    sendRefreshCookie(res, refreshToken);

    const accessToken = createAccessToken(
      user._id.toString(),
      user.accountType,
      user.accountStatus,
    );

    return res.status(201).json({
      user: buildUserPayload(user),
      accessToken,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Failed to register user",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "identifier and password are required" });
    }

    const user = await User.findOne({
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

    const tokenId      = crypto.randomUUID();
    const refreshToken = createRefreshToken(user._id.toString(), tokenId);
    const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      user:      user._id,
      tokenId,
      expiresAt,
      userAgent: req.get("User-Agent") || "",
    });

    sendRefreshCookie(res, refreshToken);

    const accessToken = createAccessToken(
      user._id.toString(),
      user.accountType,
      user.accountStatus,
    );

    return res.json({
      user: buildUserPayload(user),
      accessToken,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Failed to log in",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// ─── Refresh ─────────────────────────────────────────────────────────────────

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const payload = jwt.verify(token, refreshTokenSecret) as { sub: string; tid: string };

    const existingToken = await RefreshToken.findOne({ tokenId: payload.tid });
    if (!existingToken) {
      return res.status(401).json({ message: "Refresh token invalid or rotated" });
    }

    await existingToken.deleteOne();

    const tokenId      = crypto.randomUUID();
    const refreshToken = createRefreshToken(payload.sub, tokenId);
    const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      user:      existingToken.user,
      tokenId,
      expiresAt,
      userAgent: req.get("User-Agent") || "",
    });

    sendRefreshCookie(res, refreshToken);

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = createAccessToken(
      user._id.toString(),
      user.accountType,
      user.accountStatus,
    );

    return res.json({ accessToken });
  } catch (error: any) {
    console.error("Refresh error:", error.message);
    return res.status(401).json({ message: "Could not refresh token" });
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, refreshTokenSecret) as { tid: string };
        await RefreshToken.deleteOne({ tokenId: payload.tid });
      } catch {
        // swallow — token invalid, still clear the cookie
      }
    }
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return res.status(204).end();
  } catch (error: any) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

// ─── Get profile ─────────────────────────────────────────────────────────────

export const getProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.json({
    user: {
      id:               req.user._id,
      username:         req.user.username,
      email:            req.user.email,
      name:             req.user.name,
      surname:          req.user.surname,
      subscriptionType: req.user.subscriptionType,
      location:         req.user.location,
      profilePicture:   req.user.profilePicture,
      accountStatus:    req.user.accountStatus,
      accountType:      req.user.accountType,
      accountTier:      req.user.accountTier,
      recruiterTier:    req.user.recruiterTier,
      subscription:     req.user.subscription,
      lastLogin:        req.user.lastLogin,
      preferences:      req.user.preferences,
      savedJobs:        req.user.savedJobs,
      clickedJobs:      req.user.clickedJobs,
      searchHistory:    req.user.searchHistory,
      userPrompts:      req.user.userPrompts,
    },
  });
};