import dns from "dns";
import mongoose from "mongoose";
import { ServerApiVersion } from "mongodb";

// Force Node.js to use Google DNS directly — fixes querySrv ECONNREFUSED
// on systems where the default DNS server doesn't support SRV records.
dns.setServers(["8.8.8.8", "8.8.4.4"]);
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
