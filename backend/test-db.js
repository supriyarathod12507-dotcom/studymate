/**
 * Run: node backend/test-db.js
 * Diagnoses MongoDB connection without starting full server
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  console.log('--- StudyMate DB Test ---');
  console.log('CWD:', process.cwd());
  console.log('.env path:', path.join(__dirname, '..', '.env'));
  console.log('MONGODB_URI loaded?', !!uri);
  if (!uri) {
    console.log('FAIL: MONGODB_URI is missing from .env');
    process.exit(1);
  }
  // Hide password in log
  const safe = uri.replace(/:([^:@]+)@/, ':****@');
  console.log('URI (hidden pass):', safe);

  if (uri.includes('<') || uri.includes('PASSWORD') || uri.includes('xxxxx')) {
    console.log('FAIL: URI still has placeholder text. Put real Atlas credentials.');
    process.exit(1);
  }

  try {
    console.log('Connecting...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
    console.log('SUCCESS: Connected to', mongoose.connection.host);
    console.log('DB name:', mongoose.connection.name);
    await mongoose.disconnect();
    console.log('Done. You can run: npm start');
  } catch (e) {
    console.log('FAIL:', e.message);
    console.log('');
    console.log('Common fixes:');
    console.log('1. Atlas → Network Access → add 0.0.0.0/0 and wait until Active');
    console.log('2. Atlas → Database Access → reset user password (letters+numbers only)');
    console.log('3. Update MONGODB_URI in .env with new password');
    console.log('4. Atlas → Database → make sure cluster is NOT Paused');
    console.log('5. Turn OFF VPN if any');
    process.exit(1);
  }
}
main();
