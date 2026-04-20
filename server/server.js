import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = Number(process.env.PORT) || 5000;
// Railway sets PORT — Public Networking "target port" must match this value (see deploy logs).
console.log(`[QuickPost] PORT=${PORT} (${process.env.PORT ? "from Railway/env" : "default for local"})`);

// Railway (and most hosts) run your app behind a proxy and set X-Forwarded-For.
// Required for correct IP detection (rate limiting, logging) and avoids express-rate-limit validation errors.
app.set("trust proxy", 1);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server / same-origin requests (no Origin header)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin "${origin}" is not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  const s = mongoose.connection.readyState;
  const mongo =
    s === 1 ? "connected" : s === 2 ? "connecting" : s === 0 ? "disconnected" : "disconnecting";
  res.json({ ok: true, service: "quickpost-api", mongo });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/posts", postRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("[QuickPost Error]", err);
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    message: isProd ? "Internal server error" : (err.message || "Internal server error"),
  });
});

const mongoUri = process.env.MONGODB_URI?.trim();
const jwtSecret = process.env.JWT_SECRET?.trim();

if (!jwtSecret) {
  console.error(
    "\n[QuickPost] JWT_SECRET is missing.\n" +
      "Add to server/.env:\n" +
      "  JWT_SECRET=any-long-random-string\n"
  );
  process.exit(1);
}

if (!mongoUri) {
  console.error(
    "\n[QuickPost] MONGODB_URI is missing.\n" +
      "Create server/.env with:\n" +
      "  MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.../quickpost?retryWrites=true&w=majority\n" +
      "Run the API from the server folder: cd server && npm run dev\n"
  );
  process.exit(1);
}

// Listen immediately so Railway's proxy always has a target (avoids 502 when Mongo is slow or misconfigured).
// MongoDB connects in the background; /api/health reports `mongo` state for debugging.
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `[QuickPost] HTTP listening on 0.0.0.0:${PORT} — set Railway Public Networking to this port (see PORT in logs)`
  );
});

connectDB(mongoUri)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    if (err.message?.includes("bad auth") || err.code === 8000) {
      console.error(
        "Hint: Check Database Access username/password in Atlas. URL-encode special characters in the password."
      );
    }
    if (err.message?.includes("ENOTFOUND") || err.message?.includes("querySrv")) {
      console.error(
        "\n--- DNS / querySrv issue (connection never reached Atlas) ---\n" +
          "1) Atlas → Network Access: allow 0.0.0.0/0 for Railway.\n" +
          "2) On Railway set NODE_ENV=production (default resolver; avoids forced Google DNS).\n" +
          "3) Or set FORCE_GOOGLE_DNS=true only if you know you need it.\n" +
          "4) Try Atlas non-SRV connection string (mongodb:// host list) if SRV keeps failing.\n"
      );
    }
    console.error(
      "[QuickPost] API is up but database is unavailable — fix MONGODB_URI / Atlas; /api/posts will fail until mongo connects."
    );
  });
