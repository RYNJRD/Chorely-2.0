import { getPool } from "./server/db";

async function testConn() {
  try {
    console.log("Testing connection...");
    const pool = getPool();
    const res = await pool.query("SELECT NOW()");
    console.log("Connection successful! Server time:", res.rows[0].now);
    process.exit(0);
  } catch (err: any) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

testConn();
