import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function resetLinkBaseUrl() {
  const explicit = process.env.PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  const firstCors = process.env.CORS_ORIGIN?.split(",")[0]?.trim().replace(/\/+$/, "");
  if (firstCors) return firstCors;
  return "http://localhost:5173";
}

async function sendResetEmailResend({ to, resetUrl }) {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "QuickPost <onboarding@resend.dev>";
  if (!key) return { sent: false };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your QuickPost admin password",
      html: `<p>Reset your password (link expires in 1 hour):</p><p><a href="${resetUrl}">Set a new password</a></p><p style="font-size:12px;color:#666">${resetUrl}</p>`,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("[QuickPost] Resend API error:", res.status, text);
    return { sent: false };
  }
  return { sent: true };
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function register(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    // Only allow first-time registration when no admin exists
    const existing = await User.countDocuments();
    if (existing > 0) {
      return res.status(403).json({
        message: "Registration is closed. An admin account already exists.",
      });
    }
    const user = await User.create({ email, password });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: err.message || "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message || "Login failed" });
  }
}

export async function me(req, res) {
  res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
}

const forgotGeneric = {
  message:
    "If an account exists for this email, you will receive password reset instructions shortly.",
};

export async function forgotPassword(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json(forgotGeneric);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashResetToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const base = resetLinkBaseUrl();
    const resetUrl = `${base}/dev-post/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;

    const emailResult = await sendResetEmailResend({ to: user.email, resetUrl });
    if (!emailResult.sent) {
      console.log(
        "\n[QuickPost] Password reset (no RESEND_API_KEY — copy link within 1 hour):\n" + resetUrl + "\n"
      );
    }

    const body = { ...forgotGeneric };
    if (process.env.RETURN_PASSWORD_RESET_LINK === "true") {
      body.resetUrl = resetUrl;
    }
    res.json(body);
  } catch (err) {
    res.status(500).json({ message: err.message || "Request failed" });
  }
}

export async function resetPassword(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const token = String(req.body.token || "").trim();
    const newPassword = String(req.body.newPassword || "");
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "email, token, and newPassword are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({ email });
    if (!user?.passwordResetToken || !user?.passwordResetExpires) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }
    if (user.passwordResetExpires < new Date()) {
      return res.status(400).json({ message: "Reset link has expired. Request a new reset." });
    }
    if (user.passwordResetToken !== hashResetToken(token)) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: "Password updated. You can sign in with your new password." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Reset failed" });
  }
}
