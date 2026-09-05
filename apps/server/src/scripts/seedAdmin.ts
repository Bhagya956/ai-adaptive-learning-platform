/**
 * seedAdmin.ts
 *
 * One-time admin account creation script.
 * Run with:   npm run seed:admin  (from apps/server/)
 *
 * Reads credentials from environment variables:
 *   ADMIN_NAME     — display name
 *   ADMIN_EMAIL    — login email
 *   ADMIN_PASSWORD — plain-text password (will be hashed with bcrypt)
 *
 * Safety guarantees:
 *   - Checks whether an admin with ADMIN_EMAIL already exists first
 *   - Never creates a second admin if one already exists at that email
 *   - Password is hashed with bcryptjs (same library as auth.controller)
 *   - Role is hardcoded to "admin" — not read from any external input
 *   - This script is never imported by or executed during normal server startup
 */

import dotenv from "dotenv";
import path from "path";

// Load .env from the server root (one level above src/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import connectDB from "../config/db";

async function seedAdmin(): Promise<void> {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();

  // ── Validate env vars ──────────────────────────────────────────────────────
  if (!name || !email || !password) {
    console.error(
      "❌  Missing required environment variables.\n" +
      "    Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in apps/server/.env"
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("❌  ADMIN_PASSWORD must be at least 6 characters.");
    process.exit(1);
  }

  // ── Connect to MongoDB ─────────────────────────────────────────────────────
  await connectDB();

  // ── Check for existing admin at this email ─────────────────────────────────
  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role === "admin") {
      console.log(`ℹ️  Admin already exists: ${existing.email} (role: ${existing.role})`);
      console.log("   No changes made.");
    } else {
      console.warn(
        `⚠️  A user with email ${email} already exists but has role "${existing.role}".\n` +
        "   Admin was NOT created. Use a different ADMIN_EMAIL or remove the existing account."
      );
    }
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Hash password (same approach as auth.controller.ts) ────────────────────
  const hashedPassword = await bcrypt.hash(password, 10);

  // ── Create admin ───────────────────────────────────────────────────────────
  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",           // hardcoded — never read from request/env
    organizationId: null,
    educatorId: null,
  });

  console.log("✅  Admin account created successfully!");
  console.log(`   Name  : ${admin.name}`);
  console.log(`   Email : ${admin.email}`);
  console.log(`   Role  : ${admin.role}`);
  console.log(`   _id   : ${admin._id}`);
  console.log("   Password stored as bcrypt hash ✓");

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("❌  Seed script failed:", error);
  process.exit(1);
});
