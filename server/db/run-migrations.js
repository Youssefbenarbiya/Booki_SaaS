#!/usr/bin/env node

/**
 * Simple migration runner
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully');

    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.error(`Migrations directory not found: ${migrationsDir}`);
      return;
    }
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Sort to ensure order
    
    if (migrationFiles.length === 0) {
      console.log('No migration files found');
      return;
    }
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Run each migration
    for (const migrationFile of migrationFiles) {
      console.log(`Running migration: ${migrationFile}`);
      const migration = require(path.join(migrationsDir, migrationFile));
      await migration(client);
      console.log(`Completed migration: ${migrationFile}`);
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
runMigrations(); 