import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/register", loginLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/me", requireAuth, me);

export default router;
