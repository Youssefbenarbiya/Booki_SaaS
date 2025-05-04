#!/usr/bin/env bun

// Simple script to check if your .env file is loading correctly
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';

console.log('Checking .env file and environment variables...');

// Check if .env file exists
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  console.log('✅ .env file found at:', envPath);
  
  try {
    // Try to read the first few characters to verify it's readable
    // (Without showing sensitive information)
    const content = readFileSync(envPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log(`✅ .env file contains ${lines.length} non-comment lines`);
    
    // Check for DATABASE_URL specifically (without showing the value)
    const hasDbUrl = lines.some(line => line.startsWith('DATABASE_URL='));
    if (hasDbUrl) {
      console.log('✅ DATABASE_URL line found in .env file');
    } else {
      console.log('❌ DATABASE_URL line NOT found in .env file');
    }
  } catch (err) {
    console.error('❌ Error reading .env file:', err.message);
  }
} else {
  console.error('❌ No .env file found at:', envPath);
}

// Check environment variables
console.log('\nEnvironment variables loaded in process.env:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set (value hidden)' : '❌ Not set');
console.log('WS_PORT:', process.env.WS_PORT || '❌ Not set');
console.log('HTTP_PORT:', process.env.HTTP_PORT || '❌ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ Not set');

// Additional debug info
console.log('\nWorking directory:', process.cwd());
console.log('Node.js version:', process.version); 