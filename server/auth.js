import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function registerUser(email, password, name, avatar) {
  const db = getDB();
  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    email,
    password: hashedPassword,
    name,
    avatar: avatar || "cat1",
    role: "agent",
    status: "offline",
    createdAt: new Date(),
  };

  const result = await db.collection("users").insertOne(user);
  return { id: result.insertedId, email, name, role: user.role, avatar: user.avatar };
}

export async function loginUser(email, password) {
  const db = getDB();
  const user = await db.collection("users").findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user._id.toString(), email: user.email, name: user.name, role: user.role, avatar: user.avatar || "cat1" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Update status
  await db.collection("users").updateOne({ _id: user._id }, { $set: { status: "online" } });

  return { token, user: { id: user._id, email: user.email, name: user.name, role: user.role, avatar: user.avatar || "cat1" } };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function setUserOffline(userId) {
  const db = getDB();
  const { ObjectId } = await import("mongodb");
  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { status: "offline" } }
  );
}

export async function getOnlineUsers() {
  const db = getDB();
  return db.collection("users")
    .find({ status: "online" }, { projection: { password: 0 } })
    .toArray();
}
