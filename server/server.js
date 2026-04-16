import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

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
  res.json({ ok: true, service: "quickpost-api" });
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

connectDB(mongoUri)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`QuickPost API listening on http://localhost:${PORT}`);
    });
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
          "1) Windows: set DNS to 8.8.8.8 and 8.8.4.4 (Network adapter → IPv4 → DNS), then: ipconfig /flushdns\n" +
          "2) Turn VPN off, try phone hotspot, or another Wi‑Fi.\n" +
          "3) Use a NON-SRV URI from Atlas: Cluster → Connect → MongoDB Compass → copy the mongodb://… string (3 hosts, port 27017).\n" +
          "   Put it in MONGODB_URI and add your DB name before ?: …/quickpost?… (same user/password).\n" +
          "4) Corporate/school networks often block SRV DNS — non-SRV string usually works.\n"
      );
    }
    process.exit(1);
  });
