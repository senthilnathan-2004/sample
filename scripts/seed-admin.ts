/**
 * Bootstraps the FIRST owner admin from SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD
 * (read ONCE). The password is bcrypt-hashed into the DB; remove the env vars
 * afterwards. No admin password/hash ever lives in .env at runtime.
 *
 * Usage: npm run seed:admin
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { AdminUser } from "../src/models/AdminUser";

async function run() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.SEED_OWNER_EMAIL;
  const password = process.env.SEED_OWNER_PASSWORD;
  if (!uri) throw new Error("MONGODB_URI is required.");
  if (!email || !password) {
    throw new Error("Set SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD to seed the owner admin.");
  }

  await mongoose.connect(uri);
  const existing = await AdminUser.findOne({ email: email.toLowerCase() }).exec();
  if (existing) {
    console.log(`Owner admin ${email} already exists — skipping.`);
  } else {
    await AdminUser.create({
      name: "Owner",
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: "owner",
      isActive: true,
    });
    console.log(`✓ Owner admin created: ${email}`);
    console.log("  Now REMOVE SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD from your environment.");
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
