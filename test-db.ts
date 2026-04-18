import "dotenv/config";
import { getPool } from "./server/db";

async function testConn() {
  try {
    console.log("Testing connection...");
    const url = process.env.DATABASE_URL;
    if (!url) {
       console.error("DATABASE_URL is missing in .env");
       process.exit(1);
    }
    console.log("URL is present, attempting to connect...");
    const pool = getPool();
    const res = await pool.query("SELECT NOW()");
    console.log("Connection successful! Server time:", res.rows[0].now);
    process.exit(0);
  } catch (err: any) {
    console.error("Connection failed:", err);
    process.exit(1);
  }
}

testConn();
