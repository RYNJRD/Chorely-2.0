import { Pool } from "pg";
import "dotenv/config";

async function testConn() {
  const url = process.env.DATABASE_URL;
  console.log("Testing URL starting with:", url?.slice(0, 15));
  
  const pool = new Pool({ 
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query("SELECT NOW()");
    console.log("SUCCESS! Server time:", res.rows[0].now);
    await pool.end();
  } catch (err) {
    console.error("FAILED TO CONNECT:", err);
  }
}

testConn();
