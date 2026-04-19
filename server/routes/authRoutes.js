import { Router } from "express";
import { register, login, me, forgotPassword, resetPassword } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { loginLimiter, passwordResetLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", loginLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.get("/me", requireAuth, me);

export default router;
