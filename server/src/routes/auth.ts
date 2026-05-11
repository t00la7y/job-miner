import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  getProfile,
} from "../controllers/authController";
import {
  verifyToken,
  attachUser,
  checkAccountStatus,
} from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/profile", verifyToken, attachUser, checkAccountStatus, getProfile);

export default router;
