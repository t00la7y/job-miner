import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

const accessTokenSecret = process.env.JWT_SECRET || "change-this-secret";

interface AccessTokenPayload {
  sub: string;
  role: string;
  status: string;
  iat: number;
  exp: number;
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, accessTokenSecret) as AccessTokenPayload;
    res.locals.tokenPayload = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};

export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const payload = res.locals.tokenPayload as AccessTokenPayload | undefined;
  if (!payload?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  req.user = user;
  next();
};

export const checkAccountStatus = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.accountStatus !== "active") {
    return res.status(403).json({
      message:
        req.user.accountStatus === "suspended"
          ? "Account suspended"
          : "Account deleted",
    });
  }

  next();
};

export const requireRole = (
  requiredRole: "jobSeeker" | "recruiter" | "admin",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.accountType !== requiredRole) {
      return res.status(403).json({ message: "Insufficient role" });
    }

    next();
  };
};
