"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
router.post("/refresh", authController_1.refresh);
router.post("/logout", authController_1.logout);
router.get("/profile", authMiddleware_1.verifyToken, authMiddleware_1.attachUser, authMiddleware_1.checkAccountStatus, authController_1.getProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map