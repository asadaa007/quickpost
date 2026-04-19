import dns from "dns";
import mongoose from "mongoose";
import { ServerApiVersion } from "mongodb";

// Local dev: Google DNS often fixes Windows / ISP SRV issues for mongodb+srv://
// Railway: do not force Google DNS (NODE_ENV is often unset); use FORCE_GOOGLE_DNS=true only if you need it.
const onRailway = Boolean(process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_ENVIRONMENT);
const useGoogleDns =
  process.env.FORCE_GOOGLE_DNS === "true" ||
  (!onRailway && process.env.NODE_ENV !== "production");
if (useGoogleDns) {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}
dns.setDefaultResultOrder("ipv4first");

export function maskMongoUri(uri) {
  if (!uri || typeof uri !== "string") return "";
  return uri.replace(/:[^:@/]+@/, ":****@");
}

export async function connectDB(uri) {
  if (!uri || typeof uri !== "string" || !uri.trim()) {
    throw new Error("MONGODB_URI is empty. Set it in server/.env");
  }

  mongoose.set("strictQuery", true);

  const trimmed = uri.trim();

  console.log("Connecting to MongoDB:", maskMongoUri(trimmed));

  await mongoose.connect(trimmed, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 20_000,
    family: 4,
  });

  console.log("MongoDB connected");
}
