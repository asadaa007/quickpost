import rateLimit from "express-rate-limit";

/** Broad protection for all /api traffic (auth routes also apply their own limiters). */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});
