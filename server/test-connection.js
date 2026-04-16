/**
 * Standalone Atlas connection test.
 * Run: npm run test:db
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import dns from "dns";
import { MongoClient, ServerApiVersion } from "mongodb";

// Force Google DNS — bypasses system DNS that refuses SRV queries
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const uri = process.env.MONGODB_URI?.trim();

if (!uri) {
  console.error("MONGODB_URI is not set in server/.env");
  process.exit(1);
}

console.log("Testing Atlas connection...");
console.log("URI:", uri.replace(/:[^:@/]+@/, ":****@"));

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 20_000,
  family: 4,
});

try {
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("\n✅  SUCCESS — MongoDB Atlas connected!\n");
  console.log("   Now run:  npm run dev\n");
} catch (err) {
  console.error("\n❌  FAILED:", err.message, "\n");

  if (err.message?.includes("querySrv") || err.message?.includes("ECONNREFUSED")) {
    console.error("DNS/SRV still failing even with Google DNS.");
    console.error("→ Try connecting your PC to a phone hotspot and run this again.");
  }
  if (err.message?.includes("bad auth") || err.code === 8000) {
    console.error("Wrong username or password in MONGODB_URI.");
  }
  if (err.message?.includes("IP") || err.message?.includes("whitelist")) {
    console.error("IP not allowed → Atlas → Network Access → Add 0.0.0.0/0");
  }
} finally {
  await client.close();
}
