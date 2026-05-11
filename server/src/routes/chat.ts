import express from "express";
import { chatController } from "../controllers/chatController";
import {
  verifyToken,
  attachUser,
  checkAccountStatus,
} from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", verifyToken, attachUser, checkAccountStatus, chatController);

export default router;
