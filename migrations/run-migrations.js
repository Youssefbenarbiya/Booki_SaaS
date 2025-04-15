// Simple script to run SQL migrations
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    // Read the migration file content
    const migrationFile = path.join(__dirname, 'add_currency_fields_to_room_bookings.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Running migration: add_currency_fields_to_room_bookings.sql');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

runMigration(); 