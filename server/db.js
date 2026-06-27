import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
let db;

export async function connectDB() {
  await client.connect();
  db = client.db();
  console.log("Connected to MongoDB");

  // Create indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("messages").createIndex({ room: 1, timestamp: -1 });
  await db.collection("messages").createIndex({ timestamp: -1 });
  await db.collection("rooms").createIndex({ name: 1 }, { unique: true });

  // Seed default rooms
  const rooms = ["general", "support", "sales"];
  for (const name of rooms) {
    await db.collection("rooms").updateOne(
      { name },
      { $setOnInsert: { name, createdAt: new Date() } },
      { upsert: true }
    );
  }

  return db;
}

export function getDB() {
  return db;
}
