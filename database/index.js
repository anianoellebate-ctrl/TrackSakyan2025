// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL, // Neon connection string
//   ssl: { rejectUnauthorized: false } // ✅ required for Neon
// });

// // Test the connection
// pool.connect()
//   .then(client => {
//     console.log("Connected to Neon Postgres ✅");
//     client.release();
//   })
//   .catch(err => {
//     console.error("Database connection failed ❌:", err.stack);
//   });

// module.exports = pool;

// database.js (simpler version)
const { Pool } = require("pg");
const { createClient } = require('@supabase/supabase-js');
require("dotenv").config();

console.log("🔄 Initializing database connections...");

// 🟢 Neon Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test Neon connection
pool.on('connect', () => {
  console.log("✅ Connected to DEFAULT Neon database");
});

pool.on('error', (err) => {
  console.error("❌ Neon database connection error:", err);
});

// 🔵 Supabase Database
const supabase = createClient(
  "https://ukbwksiqzueclsvsqfiu.supabase.co",
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYndrc2lxenVlY2xzdnNxZml1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjYxNzMsImV4cCI6MjA3MzQwMjE3M30.iwcbs5xn9ArvEw0WWDGq09HTp9nHsiSa7w7tIsZk7Zs"
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrYndrc2lxenVlY2xzdnNxZml1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgyNjE3MywiZXhwIjoyMDczNDAyMTczfQ.lc1xXL4LQ8jcq7WtHT3hf8c3gulj6HZgt5b-Cbe_6_c"
);

console.log("✅ Partner Supabase client initialized");

// Test Supabase connection on first use
let supabaseTested = false;
const originalFrom = supabase.from;
supabase.from = function(table) {
  if (!supabaseTested) {
    console.log("✅ Connected to PARTNER Supabase database (first query)");
    supabaseTested = true;
  }
  return originalFrom.call(this, table);
};

module.exports = pool;
module.exports.supabase = supabase;

console.log("🚀 Database module ready:");
console.log("   🟢 TrackSakyan: Default database");
console.log("   🔵 BayadBox: Partner database");
