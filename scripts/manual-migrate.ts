import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";
import path from "path";

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
  }

  const pool = new Pool({ 
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Reading migration file...");
    const sqlPath = path.join(process.cwd(), "migrations", "0000_sticky_avengers.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Applying migration to Neon...");
    // Split by ; but handle potential multi-line statements. 
    // Drizzle migrations are usually safe to run as one block if supported, 
    // but better to run as individual queries or just the whole block.
    await pool.query(sql);
    
    console.log("SUCCESS! Migration applied.");
    process.exit(0);
  } catch (err: any) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
